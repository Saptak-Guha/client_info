# app.py
import os
from flask import Flask, render_template, request
import pandas as pd
import numpy as np
from nltk.sentiment import SentimentIntensityAnalyzer
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
from io import BytesIO
import seaborn as sns
import base64
import nltk
from datetime import datetime

# Download required NLTK data
nltk.download('vader_lexicon')

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load data from CSV
def load_data(csv_path):
    df = pd.read_csv(csv_path)
    
    # Split data into reviews and market products
    our_reviews = df[df['record_type'] == 'review'][['review', 'rating']]
    market_df = df[df['record_type'] == 'product'][['product', 'avg_rating', 'price', 'units_sold', 'review_count']]
    our_metadata = df[df['record_type'] == 'our_metadata'].iloc[0]
    
    return our_reviews, market_df, our_metadata

# Sentiment analysis with VADER
def analyze_sentiment(reviews_df):
    sia = SentimentIntensityAnalyzer()
    reviews_df['sentiment'] = reviews_df['review'].apply(lambda x: sia.polarity_scores(x)['compound']) 
    reviews_df['sentiment_category'] = reviews_df['sentiment'].apply(
        lambda x: 'Positive' if x > 0.05 else 'Negative' if x < -0.05 else 'Neutral'
    )
    return reviews_df

# Feature engineering and XGBoost ranking
def calculate_product_rankings(our_reviews, market_df, our_metadata):
    # Sentiment analysis
    our_reviews = analyze_sentiment(our_reviews)
    
    # Calculate our product metrics
    our_metrics = {
        'product': 'Our Product',
        'avg_rating': our_reviews['rating'].mean(),
        'avg_sentiment': our_reviews['sentiment'].mean(),
        'positive_pct': (our_reviews['sentiment_category'] == 'Positive').mean() * 100,
        'review_count': len(our_reviews),
        'price': our_metadata['price'],
        'units_sold': our_metadata['units_sold']
    }
    
    # Prepare data for ranking model
    ranking_data = market_df.copy()
    
    # Add our product to the ranking data
    ranking_data = pd.concat([ranking_data, pd.DataFrame([our_metrics])], ignore_index=True)
    
    # Feature engineering
    ranking_data['value_score'] = ranking_data.apply(
        lambda row: row['avg_rating'] / (row['price'] / 10) if row['price'] != 0 else 0, axis=1
    )
    ranking_data['popularity'] = ranking_data['units_sold'] * ranking_data['avg_rating']
    
    noise = np.clip(np.random.normal(0, 50, len(ranking_data)), -100, 100)
    ranking_data['sales_velocity'] = ranking_data['units_sold'] * ranking_data['avg_rating'] * 0.8 + noise

    # Clean target variable
    ranking_data = ranking_data.dropna(subset=['sales_velocity'])
    ranking_data = ranking_data[np.isfinite(ranking_data['sales_velocity'])]
    
    # Train XGBoost model
    X = ranking_data[['avg_rating', 'price', 'units_sold', 'review_count', 'value_score', 'popularity']]
    y = ranking_data['sales_velocity']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = XGBRegressor(objective='reg:squarederror', n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Predict and rank
    ranking_data['rank_score'] = model.predict(X)
    ranking_data['rank'] = ranking_data['rank_score'].rank(ascending=False).astype(int)
    ranking_data = ranking_data.sort_values('rank')
    
    return ranking_data, our_reviews

# Generate visualizations
def generate_visualizations(ranking_data, our_reviews):
    visuals = {}
    
    # Market ranking bar chart
    plt.figure(figsize=(10, 6))
    ranked_products = ranking_data.sort_values('rank_score', ascending=False)
    sns.barplot(x='rank_score', y='product', data=ranked_products, palette='viridis')
    plt.title('Product Ranking in Market')
    plt.xlabel('Rank Score')
    plt.ylabel('Product')
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    visuals['ranking_chart'] = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    
    # Sentiment distribution
    plt.figure(figsize=(8, 6))
    sentiment_counts = our_reviews['sentiment_category'].value_counts()
    sns.barplot(x=sentiment_counts.index, y=sentiment_counts.values, palette='pastel')
    plt.title('Customer Sentiment Distribution')
    plt.xlabel('Sentiment')
    plt.ylabel('Count')
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    visuals['sentiment_chart'] = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    
    # Rating vs sentiment scatter
    plt.figure(figsize=(8, 6))
    sns.scatterplot(x='rating', y='sentiment', data=our_reviews, hue='sentiment_category', palette='Set2', s=100)
    plt.title('Rating vs Sentiment Correlation')
    plt.xlabel('Rating (1-5)')
    plt.ylabel('Sentiment Score')
    plt.axhline(y=0, color='gray', linestyle='--')
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    visuals['scatter_chart'] = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    
    return visuals

@app.route('/', methods=['GET', 'POST'])
def dashboard():
    if request.method == 'POST':
        # Handle file upload
        if 'csv_file' not in request.files:
            return render_template('dashboard.html', error='No file selected')
            
        file = request.files['csv_file']
        if file.filename == '':
            return render_template('dashboard.html', error='No file selected')
            
        if file:
            csv_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(csv_path)
            
            try:
                # Load data
                our_reviews, market_df, our_metadata = load_data(csv_path)
                
                # Calculate rankings & sentiment
                ranking_data, analyzed_reviews = calculate_product_rankings(
                    our_reviews, market_df, our_metadata
                )
                
                # Extract our product data
                our_product_row = ranking_data[ranking_data['product'] == 'Our Product'].iloc[0]
                our_product_data = our_product_row.to_dict()
                
                # Prepare market ranking
                market_ranking = ranking_data[['rank', 'product', 'avg_rating', 'price', 'units_sold', 'rank_score']].to_dict('records')
                
                # Top negative reviews
                negative_reviews = (
                    analyzed_reviews[analyzed_reviews['sentiment_category'] == 'Negative']
                    .sort_values('sentiment')
                    .head(3)
                ).to_dict('records')
                
                # Generate visualizations
                visuals = generate_visualizations(ranking_data, analyzed_reviews)
                
                # Compute market share
                total_units = sum(item['units_sold'] for item in market_ranking)
                market_share = (our_product_data['units_sold'] / total_units * 100) if total_units > 0 else 0
                
                # Pass now timestamp
                now = datetime.now()
                
                return render_template(
                    'dashboard.html',
                    our_product=our_product_data,
                    market_ranking=market_ranking,
                    negative_reviews=negative_reviews,
                    visuals=visuals,
                    market_share=market_share,
                    total_units=total_units,
                    now=now,
                    filename=file.filename
                )
                
            except Exception as e:
                return render_template('dashboard.html', error=f"Error processing file: {str(e)}")
    
    return render_template('dashboard.html')

if __name__ == '__main__':
    app.run(debug=True)