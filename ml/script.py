import os
import logging
from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
from nltk.sentiment import SentimentIntensityAnalyzer
import matplotlib.pyplot as plt
from io import BytesIO
import seaborn as sns
import base64
import nltk
from datetime import datetime
import warnings

warnings.filterwarnings('ignore')

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Download required NLTK data
try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except nltk.downloader.DownloadError:
    logger.info("Vader lexicon not found, attempting download...")
    try:
        nltk.download('vader_lexicon', quiet=True)
        logger.info("Vader lexicon downloaded successfully.")
    except Exception as e:
        logger.error(f"Error downloading vader_lexicon: {e}")
        # Depending on criticality, you might want to exit or disable sentiment features
        # For now, we'll let it pass, but subsequent sentiment analysis might fail.

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Set matplotlib backend for server environments
plt.switch_backend('Agg')
sns.set_style("whitegrid")
plt.rcParams['figure.dpi'] = 100

REQUIRED_COLS = ['record_type', 'review', 'rating', 'product', 'avg_rating', 'price', 'units_sold', 'review_count']

def encode_plot():
    """Encode matplotlib plot to base64 string"""
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', facecolor='white')
    buf.seek(0)
    img = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    return img

def load_and_validate_data(csv_path):
    """Load and validate CSV data with proper error handling"""
    try:
        df = pd.read_csv(csv_path)

        # Validate required columns
        missing_cols = [col for col in REQUIRED_COLS if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Missing required columns: {', '.join(missing_cols)}")

        # Clean and validate data
        df = df.dropna(subset=['record_type'])

        # Extract different record types
        review_data = df[df['record_type'] == 'review'].copy()
        product_data = df[df['record_type'] == 'product'].copy()
        metadata = df[df['record_type'] == 'our_metadata'].copy() # Ensure copy to avoid SettingWithCopyWarning

        if review_data.empty:
            raise ValueError("No review data found in the dataset for 'record_type' = 'review'.")
        if product_data.empty:
            raise ValueError("No competitor product data found in the dataset for 'record_type' = 'product'.")
        if metadata.empty:
            raise ValueError("No 'our_metadata' record found in the dataset.")
        elif len(metadata) > 1:
            logger.warning("Multiple 'our_metadata' records found. Using the first one.")
            our_meta = metadata.iloc[0]
        else:
            our_meta = metadata.iloc[0]

        # Clean review data
        review_data = review_data.dropna(subset=['review', 'rating'])
        review_data['rating'] = pd.to_numeric(review_data['rating'], errors='coerce')
        review_data = review_data[(review_data['rating'] >= 1) & (review_data['rating'] <= 5)].copy() # Ensure copy

        # Clean product data
        numeric_cols = ['avg_rating', 'price', 'units_sold', 'review_count']
        for col in numeric_cols:
            product_data[col] = pd.to_numeric(product_data[col], errors='coerce')
        product_data = product_data.dropna(subset=numeric_cols).copy() # Ensure copy

        # Get our product metadata - convert only relevant fields to numeric
        our_meta['price'] = pd.to_numeric(our_meta.get('price'), errors='coerce')
        our_meta['units_sold'] = pd.to_numeric(our_meta.get('units_sold'), errors='coerce')
        if pd.isna(our_meta['price']) or pd.isna(our_meta['units_sold']):
             raise ValueError("Our product metadata (price or units_sold) is missing or invalid.")

        return review_data, product_data, our_meta

    except Exception as e:
        logger.error(f"Error loading or validating data: {str(e)}")
        raise

def perform_sentiment_analysis(reviews_df):
    """Enhanced sentiment analysis with categorization"""
    # Check if vader_lexicon is available, otherwise skip sentiment analysis
    try:
        nltk.data.find('sentiment/vader_lexicon.zip')
        sia = SentimentIntensityAnalyzer()
    except nltk.downloader.DownloadError:
        logger.warning("Vader lexicon not available. Skipping sentiment analysis.")
        reviews_df['sentiment_compound'] = 0.0
        reviews_df['sentiment_positive'] = 0.0
        reviews_df['sentiment_negative'] = 0.0
        reviews_df['sentiment_neutral'] = 1.0
        reviews_df['sentiment_category'] = 'Neutral'
        return reviews_df

    # Calculate sentiment scores
    sentiment_scores = reviews_df['review'].astype(str).apply(
        lambda x: sia.polarity_scores(x)
    )

    reviews_df['sentiment_compound'] = sentiment_scores.apply(lambda x: x['compound'])
    reviews_df['sentiment_positive'] = sentiment_scores.apply(lambda x: x['pos'])
    reviews_df['sentiment_negative'] = sentiment_scores.apply(lambda x: x['neg'])
    reviews_df['sentiment_neutral'] = sentiment_scores.apply(lambda x: x['neu'])

    # Categorize sentiment with more nuanced thresholds
    def categorize_sentiment(score):
        if score >= 0.3:
            return 'Very Positive'
        elif score >= 0.1:
            return 'Positive'
        elif score >= -0.1:
            return 'Neutral'
        elif score >= -0.3:
            return 'Negative'
        else:
            return 'Very Negative'

    reviews_df['sentiment_category'] = reviews_df['sentiment_compound'].apply(categorize_sentiment)

    return reviews_df

def calculate_market_position(our_reviews, product_data, our_metadata):
    """Calculate comprehensive market position analysis"""

    # Analyze our product reviews
    our_reviews_analyzed = perform_sentiment_analysis(our_reviews)

    # Calculate our product metrics
    our_metrics = {
        'product_name': 'Our Product',
        'avg_rating': our_reviews_analyzed['rating'].mean(),
        'review_count': len(our_reviews_analyzed),
        'price': our_metadata['price'],
        'units_sold': our_metadata['units_sold'],
        'avg_sentiment': our_reviews_analyzed['sentiment_compound'].mean(),
        'positive_review_pct': (our_reviews_analyzed['sentiment_category'].isin(['Positive', 'Very Positive']).sum() / len(our_reviews_analyzed)) * 100 if len(our_reviews_analyzed) > 0 else 0,
        'negative_review_pct': (our_reviews_analyzed['sentiment_category'].isin(['Negative', 'Very Negative']).sum() / len(our_reviews_analyzed)) * 100 if len(our_reviews_analyzed) > 0 else 0
    }

    # Calculate advanced metrics
    our_metrics['value_score'] = our_metrics['avg_rating'] / (our_metrics['price'] / 100) if our_metrics['price'] > 0 else 0
    our_metrics['popularity_score'] = our_metrics['units_sold'] * our_metrics['avg_rating']
    our_metrics['engagement_score'] = our_metrics['review_count'] * our_metrics['avg_rating']

    # Prepare competitor data
    competitors = product_data.copy()
    # Handle division by zero for competitor price
    competitors['value_score'] = competitors.apply(
        lambda row: row['avg_rating'] / (row['price'] / 100) if row['price'] > 0 else 0, axis=1
    )
    competitors['popularity_score'] = competitors['units_sold'] * competitors['avg_rating']
    competitors['engagement_score'] = competitors['review_count'] * competitors['avg_rating']

    # Market analysis
    total_market_units = competitors['units_sold'].sum() + our_metrics['units_sold']
    market_analysis = {
        'total_market_units': total_market_units,
        'our_market_share': (our_metrics['units_sold'] / total_market_units) * 100 if total_market_units > 0 else 0,
        'avg_market_price': competitors['price'].mean(),
        'avg_market_rating': competitors['avg_rating'].mean(),
        'price_percentile': (competitors['price'] < our_metrics['price']).sum() / len(competitors) * 100 if len(competitors) > 0 else 0,
        'rating_percentile': (competitors['avg_rating'] < our_metrics['avg_rating']).sum() / len(competitors) * 100 if len(competitors) > 0 else 0,
        'units_percentile': (competitors['units_sold'] < our_metrics['units_sold']).sum() / len(competitors) * 100 if len(competitors) > 0 else 0
    }

    # Calculate rankings
    all_products = competitors.copy()
    our_row = pd.DataFrame([{
        'product': 'Our Product',
        'avg_rating': our_metrics['avg_rating'],
        'price': our_metrics['price'],
        'units_sold': our_metrics['units_sold'],
        'review_count': our_metrics['review_count'],
        'value_score': our_metrics['value_score'],
        'popularity_score': our_metrics['popularity_score'],
        'engagement_score': our_metrics['engagement_score']
    }])

    all_products = pd.concat([all_products, our_row], ignore_index=True)

    # Rank products (individual ranks)
    all_products['rating_rank'] = all_products['avg_rating'].rank(ascending=False, method='dense')
    all_products['price_rank'] = all_products['price'].rank(ascending=True, method='dense')  # Lower price = better rank
    all_products['units_rank'] = all_products['units_sold'].rank(ascending=False, method='dense')
    all_products['value_rank'] = all_products['value_score'].rank(ascending=False, method='dense')
    all_products['popularity_rank'] = all_products['popularity_score'].rank(ascending=False, method='dense')

    # Overall composite score (weighted)
    weights = {'avg_rating': 0.3, 'units_sold': 0.25, 'value_score': 0.25, 'review_count': 0.2}

    # Normalize components to prevent division by zero if max is 0
    max_units_sold = all_products['units_sold'].max()
    norm_units_sold = (all_products['units_sold'] / max_units_sold) if max_units_sold > 0 else 0

    max_value_score = all_products['value_score'].max()
    norm_value_score = (all_products['value_score'] / max_value_score) if max_value_score > 0 else 0

    max_review_count = all_products['review_count'].max()
    norm_review_count = (all_products['review_count'] / max_review_count) if max_review_count > 0 else 0

    # Ensure all components used in composite score are numeric and handle NaNs
    # Convert numpy arrays to Series before calculating composite score if they originated from division
    all_products['composite_score'] = (
        all_products['avg_rating'].fillna(0) * weights['avg_rating'] +
        (pd.Series(norm_units_sold, index=all_products.index) if isinstance(norm_units_sold, np.ndarray) else norm_units_sold).fillna(0) * weights['units_sold'] +
        (pd.Series(norm_value_score, index=all_products.index) if isinstance(norm_value_score, np.ndarray) else norm_value_score).fillna(0) * weights['value_score'] +
        (pd.Series(norm_review_count, index=all_products.index) if isinstance(norm_review_count, np.ndarray) else norm_review_count).fillna(0) * weights['review_count']
    )


    # Calculate overall_rank and ensure it's an integer
    all_products['overall_rank'] = all_products['composite_score'].rank(ascending=False, method='dense').astype(int)
    all_products = all_products.sort_values('overall_rank')

    return our_metrics, market_analysis, all_products, our_reviews_analyzed

def generate_insights(our_metrics, market_analysis, ranking_data_df, our_reviews):
    """Generate actionable business insights"""
    insights = []

    # Market position insights
    # ranking_data_df is now guaranteed to be a DataFrame
    our_rank_row = ranking_data_df[ranking_data_df['product'] == 'Our Product']
    if not our_rank_row.empty:
        our_rank = our_rank_row['overall_rank'].iloc[0]
        total_products = len(ranking_data_df) # Use the DataFrame directly

        if our_rank <= 3:
            insights.append({
                'type': 'success',
                'title': 'Market Leader Position',
                'message': f'Your product ranks **#{int(our_rank)}** out of {total_products} competitors, placing you in the **top tier**. This indicates strong overall performance across key metrics.',
                'action': 'Leverage this position for premium pricing, brand building, and market expansion. Continue innovating to maintain your edge.'
            })
        elif our_rank <= total_products / 2:
            insights.append({
                'type': 'warning',
                'title': 'Mid-Market Position',
                'message': f'Your product ranks **#{int(our_rank)}** out of {total_products}, indicating moderate market performance. There\'s significant room to improve.',
                'action': 'Focus on differentiating features, improving customer satisfaction, and optimizing your marketing efforts to climb the ranks.'
            })
        else:
            insights.append({
                'type': 'danger',
                'title': 'Competitive Challenge',
                'message': f'Your product ranks **#{int(our_rank)}** out of {total_products}, suggesting a need for significant strategic review.',
                'action': 'Urgent review of product quality, pricing strategy, marketing effectiveness, and competitive advantages is recommended to improve your standing.'
            })
    else:
        insights.append({
            'type': 'info',
            'title': 'Ranking Data Unavailable',
            'message': 'Could not determine overall product ranking. Ensure sufficient competitor data is provided.',
            'action': 'Verify the integrity of your dataset.'
        })


    # Pricing insights
    if market_analysis['price_percentile'] > 75:
        insights.append({
            'type': 'warning',
            'title': 'Premium Pricing',
            'message': f'Your price is higher than **{market_analysis['price_percentile']:.1f}%** of competitors. This indicates a premium positioning.',
            'action': 'Ensure your value proposition (quality, features, brand) strongly justifies this premium pricing. Monitor customer feedback regarding value for money.'
        })
    elif market_analysis['price_percentile'] < 25 and our_metrics['avg_rating'] > market_analysis['avg_market_rating']:
        insights.append({
            'type': 'success',
            'title': 'Competitive Advantage: Price-Quality Balance',
            'message': f'Your price is lower than **{100-market_analysis['price_percentile']:.1f}%** of competitors, while your average rating is **{our_metrics['avg_rating']:.1f}** (above market average of {market_analysis['avg_market_rating']:.1f}).',
            'action': 'You have a strong competitive advantage. Consider if there\'s room for a slight price increase without sacrificing sales volume, or double down on capturing market share.'
        })
    elif market_analysis['price_percentile'] < 25:
        insights.append({
            'type': 'info',
            'title': 'Competitive Pricing',
            'message': f'Your price is lower than **{100-market_analysis['price_percentile']:.1f}%** of competitors. This positions you as a budget-friendly option.',
            'action': 'Assess if this pricing strategy aligns with your brand. While it can drive volume, ensure profitability is maintained and that you\'re not perceived as lower quality.'
        })

    # Quality insights
    if our_metrics['avg_rating'] < 3.5:
        insights.append({
            'type': 'danger',
            'title': 'Quality Concerns',
            'message': f'An average rating of **{our_metrics['avg_rating']:.1f}** indicates potential customer dissatisfaction with product quality or experience.',
            'action': 'Prioritize product quality improvements based on negative review analysis. Enhance customer service and consider a proactive outreach program.'
        })
    elif our_metrics['avg_rating'] >= 4.5:
        insights.append({
            'type': 'success',
            'title': 'Excellent Quality',
            'message': f'Outstanding average rating of **{our_metrics['avg_rating']:.1f}** demonstrates strong customer satisfaction and product quality.',
            'action': 'Promote your high ratings extensively in marketing. Gather testimonials and explore opportunities to expand your product line leveraging this strong reputation.'
        })

    # Sentiment insights
    if our_metrics['negative_review_pct'] > 20:
        insights.append({
            'type': 'warning',
            'title': 'Customer Sentiment Alert',
            'message': f'A significant **{our_metrics['negative_review_pct']:.1f}%** of your reviews are categorized as negative or very negative.',
            'action': 'Conduct a deep dive into the themes and keywords in negative feedback. Implement targeted product improvements, clarify product descriptions, or enhance support.'
        })
    elif our_metrics['positive_review_pct'] > 75:
        insights.append({
            'type': 'success',
            'title': 'Strong Positive Sentiment',
            'message': f'An impressive **{our_metrics['positive_review_pct']:.1f}%** of your reviews are positive or very positive, indicating high customer satisfaction.',
            'action': 'Utilize these positive sentiments in marketing campaigns. Identify key drivers of positive feedback and reinforce them in future product development.'
        })

    # Market share insights
    if market_analysis['our_market_share'] < 5 and market_analysis['total_market_units'] > 0:
        insights.append({
            'type': 'info',
            'title': 'Market Share Opportunity',
            'message': f'Your current market share of **{market_analysis['our_market_share']:.1f}%** suggests significant growth potential in the broader market.',
            'action': 'Develop aggressive strategies to increase market penetration. This could include targeted advertising, partnerships, or competitive pricing adjustments.'
        })
    elif market_analysis['our_market_share'] > 20 and market_analysis['total_market_units'] > 0:
        insights.append({
            'type': 'success',
            'title': 'Strong Market Share',
            'message': f'With a market share of **{market_analysis['our_market_share']:.1f}%**, you are a significant player in the market.',
            'action': 'Focus on defending your market position, exploring new segments, and possibly acquiring smaller competitors. Continue to innovate to stay ahead.'
        })

    return insights

def create_visualizations(ranking_data_df, our_reviews, market_analysis):
    """Generate comprehensive visualizations"""
    visualizations = {}

    # Set consistent color scheme
    our_color = '#FF6B35'
    competitor_color = '#4ECDC4'

    # 1. Overall Market Ranking
    plt.figure(figsize=(12, 8))
    # Ensure product names are strings for y-axis
    ranking_data_df['product'] = ranking_data_df['product'].astype(str)
    colors = [our_color if product == 'Our Product' else competitor_color for product in ranking_data_df['product']]
    bars = plt.barh(ranking_data_df['product'], ranking_data_df['composite_score'], color=colors)
    plt.xlabel('Composite Performance Score')
    plt.title('Market Position Ranking (Higher Score = Better Performance)')
    plt.gca().invert_yaxis() # Invert y-axis to show highest score at the top

    # Add value labels
    for bar, score in zip(bars, ranking_data_df['composite_score']):
        plt.text(bar.get_width() + 0.01, bar.get_y() + bar.get_height()/2,
                 f'{score:.2f}', va='center', fontweight='bold')

    plt.tight_layout()
    visualizations['market_ranking'] = encode_plot()

    # 2. Price vs Rating Scatter Plot
    plt.figure(figsize=(10, 8))
    competitors_data = ranking_data_df[ranking_data_df['product'] != 'Our Product']
    our_data = ranking_data_df[ranking_data_df['product'] == 'Our Product']

    # Ensure s parameter is not zero or negative for scatter plot
    s_competitors = np.maximum(competitors_data['units_sold'] / 50, 10) # Minimum size 10
    s_our = np.maximum(our_data['units_sold'] / 50, 10)

    plt.scatter(competitors_data['price'], competitors_data['avg_rating'], s=s_competitors, alpha=0.6, color=competitor_color, label='Competitors')
    plt.scatter(our_data['price'], our_data['avg_rating'],
            s=s_our,
            color=our_color,
            label='Our Product',
            edgecolors='black',
            linewidth=2)

    plt.xlabel('Price ($)')
    plt.ylabel('Average Rating')
    plt.title('Price vs Rating Analysis (Bubble size = Units Sold)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    visualizations['price_rating_analysis'] = encode_plot()

    # 3. Sentiment Distribution
    plt.figure(figsize=(10, 6))
    sentiment_order = ['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive']
    sentiment_counts = our_reviews['sentiment_category'].value_counts().reindex(sentiment_order, fill_value=0)
    colors_sentiment = {'Very Positive': '#2ECC71', 'Positive': '#27AE60', 'Neutral': '#F39C12',
                       'Negative': '#E74C3C', 'Very Negative': '#C0392B'}

    bars = plt.bar(sentiment_counts.index, sentiment_counts.values, color=[colors_sentiment.get(cat, '#BDC3C7') for cat in sentiment_counts.index])
    plt.title('Customer Sentiment Distribution for Our Product')
    plt.ylabel('Number of Reviews')
    plt.xticks(rotation=45)

    # Add percentage labels
    total_reviews = len(our_reviews)
    if total_reviews > 0:
        for bar, count in zip(bars, sentiment_counts.values):
            percentage = (count / total_reviews) * 100
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                     f'{percentage:.1f}%', ha='center', va='bottom', fontweight='bold')

    plt.tight_layout()
    visualizations['sentiment_distribution'] = encode_plot()

    # 4. Market Share Visualization
    plt.figure(figsize=(8, 8))
    our_share = market_analysis['our_market_share']
    competitor_share = 100 - our_share

    sizes = [our_share, competitor_share]
    labels = [f'Our Product ({our_share:.1f}%)', f'Competitors ({competitor_share:.1f}%)']
    colors = [our_color, competitor_color]

    plt.pie(sizes, labels=labels, colors=colors, autopct='', startangle=90, pctdistance=0.85)
    plt.title('Market Share Distribution (Based on Units Sold)')
    plt.axis('equal') # Equal aspect ratio ensures that pie is drawn as a circle.
    visualizations['market_share'] = encode_plot()

    # 5. Performance Radar Chart
    plt.figure(figsize=(10, 10))
    our_product = ranking_data_df[ranking_data_df['product'] == 'Our Product']
    if not our_product.empty:
        our_product = our_product.iloc[0]

        metrics = ['Avg. Rating', 'Value Score', 'Market Share', 'Price Comp.', 'Engagement']
        our_values = []

        # Ensure max values are not zero to prevent division by zero
        max_rating = ranking_data_df['avg_rating'].max()
        our_values.append((our_product['avg_rating'] / max_rating) * 100 if max_rating > 0 else 0)

        max_value_score = ranking_data_df['value_score'].max()
        our_values.append((our_product['value_score'] / max_value_score) * 100 if max_value_score > 0 else 0)

        our_values.append(market_analysis['our_market_share'])

        our_values.append(100 - market_analysis['price_percentile']) # Inverted: higher percentile means higher price

        max_engagement_score = ranking_data_df['engagement_score'].max()
        our_values.append((our_product['engagement_score'] / max_engagement_score) * 100 if max_engagement_score > 0 else 0)


        # Add first value at end to close the radar chart
        our_values += our_values[:1]
        angles = np.linspace(0, 2 * np.pi, len(metrics), endpoint=False).tolist()
        angles += angles[:1]

        ax = plt.subplot(111, projection='polar')
        ax.plot(angles, our_values, 'o-', linewidth=2, color=our_color, label='Our Product')
        ax.fill(angles, our_values, alpha=0.25, color=our_color)
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(metrics)
        ax.set_yticks([20, 40, 60, 80, 100])
        ax.set_ylim(0, 100)
        plt.title('Our Product Performance Profile (Normalized to 0-100)', pad=20)
        visualizations['performance_radar'] = encode_plot()
    else:
        logger.warning("Our product data not found in ranking_data_df for radar chart.")
        visualizations['performance_radar'] = None # Or provide a placeholder image

    return visualizations


@app.route('/', methods=['GET', 'POST'])
def dashboard():
    if request.method == 'POST':
        file = request.files.get('csv_file')
        if not file or file.filename == '':
            return render_template('dashboard.html', error='Please select a CSV file to upload.')

        filename = file.filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        try:
            file.save(file_path)
            logger.info(f"File '{filename}' uploaded successfully.")
        except Exception as e:
            logger.error(f"Error saving file '{filename}': {e}")
            return render_template('dashboard.html', error=f'Error saving file: {str(e)}')

        try:
            # Load and analyze data
            review_data, product_data, our_metadata = load_and_validate_data(file_path)
            # ranking_data is a DataFrame here
            our_metrics, market_analysis, ranking_data, analyzed_reviews = calculate_market_position(
                review_data, product_data, our_metadata
            )

            # Pass ranking_data (DataFrame) directly to generate_insights and create_visualizations
            insights = generate_insights(our_metrics, market_analysis, ranking_data, analyzed_reviews)
            visualizations = create_visualizations(ranking_data, analyzed_reviews, market_analysis)

            # ONLY convert ranking_data to dict('records') right before passing to template
            ranking_data_for_template = ranking_data.to_dict('records')

            context = {
                'our_metrics': our_metrics,
                'market_analysis': market_analysis,
                'ranking_data': ranking_data_for_template, # This is now a list of dicts for Jinja
                'insights': insights,
                'visualizations': visualizations,
                'negative_reviews': analyzed_reviews[
                    analyzed_reviews['sentiment_category'].isin(['Negative', 'Very Negative'])
                ].nsmallest(5, 'sentiment_compound').to_dict('records'),
                'positive_reviews': analyzed_reviews[
                    analyzed_reviews['sentiment_category'].isin(['Positive', 'Very Positive'])
                ].nlargest(3, 'sentiment_compound').to_dict('records'),
                'filename': filename,
                'analysis_timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }

            return render_template('dashboard.html', **context)

        except Exception as e:
            logger.exception("Error processing file during analysis.")
            return render_template('dashboard.html',
                                 error=f'Error processing file: {str(e)}. Please check your CSV file format and content.')

    return render_template('dashboard.html')

@app.route('/api/insights')
def api_insights():
    """API endpoint for getting insights data - Placeholder for potential future AJAX integration"""
    # This endpoint can be extended to provide JSON data for dynamic dashboards
    return jsonify({'status': 'API endpoint ready - integrate with your frontend for dynamic data loading.'})

if __name__ == '__main__':
    # When running in production, set debug=False and provide a more robust server
    app.run(debug=True, host='0.0.0.0', port=5000)