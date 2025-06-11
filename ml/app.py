from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

app = Flask(__name__)
CORS(app)

class InventoryManager:
    def __init__(self):
        self.restock_model = None
        self.performance_model = None
        self.restock_scaler = StandardScaler()
        self.performance_scaler = StandardScaler()
        self.restock_data = None
        self.performance_data = None
        
    def load_data(self):
        """Load and prepare data"""
        try:
            # Load CSV files
            self.restock_data = pd.read_csv('restock.csv')
            self.performance_data = pd.read_csv('perf.csv')
            
            # Add product_id to performance data (assuming same order)
            self.performance_data['product_id'] = [f'P{str(i+1).zfill(3)}' for i in range(len(self.performance_data))]
            
            return True
        except Exception as e:
            print(f"Error loading data: {e}")
            return False
    
    def train_restock_model(self):
        """Train model to predict restock amount"""
        try:
            # Features for restock prediction
            features = [
                'current_inventory_level', 'safety_stock_level', 'historical_demand_last_n_days',
                'seasonality_flag', 'lead_time', 'production_capacity', 'batch_size',
                'in_transit_quantity', 'avg_daily_demand', 'demand_variance',
                'demand_std_deviation', 'forecasted_demand_next_lead_time'
            ]
            
            X = self.restock_data[features]
            
            # Calculate restock amount as target variable
            # Restock = max(0, safety_stock + forecasted_demand - current_inventory - in_transit)
            y = np.maximum(0, 
                self.restock_data['safety_stock_level'] + 
                self.restock_data['forecasted_demand_next_lead_time'] - 
                self.restock_data['current_inventory_level'] - 
                self.restock_data['in_transit_quantity']
            )
            
            # Scale features
            X_scaled = self.restock_scaler.fit_transform(X)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
            
            # Train model
            self.restock_model = RandomForestRegressor(n_estimators=100, random_state=42)
            self.restock_model.fit(X_train, y_train)
            
            # Evaluate
            y_pred = self.restock_model.predict(X_test)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            print(f"Restock Model - MAE: {mae:.2f}, R2: {r2:.2f}")
            return True
            
        except Exception as e:
            print(f"Error training restock model: {e}")
            return False
    
    def train_performance_model(self):
        """Train model to predict performance score"""
        try:
            # Features for performance prediction
            features = [
                'avg_rating', 'sentiment_score', 'units_sold', 'price', 'value_score',
                'review_count', 'return_rate', 'popularity', 'competitor_avg_price', 'feature_gap_score'
            ]
            
            X = self.performance_data[features]
            
            # Create performance score as target (weighted combination)
            y = (
                self.performance_data['avg_rating'] * 0.3 +
                (self.performance_data['sentiment_score'] + 1) * 2.5 * 0.2 +  # normalize sentiment
                np.log1p(self.performance_data['units_sold']) * 0.2 +
                (1 - self.performance_data['return_rate']) * 5 * 0.15 +
                np.log1p(self.performance_data['popularity']) * 0.15
            )
            
            # Scale features
            X_scaled = self.performance_scaler.fit_transform(X)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
            
            # Train model
            self.performance_model = RandomForestRegressor(n_estimators=100, random_state=42)
            self.performance_model.fit(X_train, y_train)
            
            # Evaluate
            y_pred = self.performance_model.predict(X_test)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            print(f"Performance Model - MAE: {mae:.2f}, R2: {r2:.2f}")
            return True
            
        except Exception as e:
            print(f"Error training performance model: {e}")
            return False
    
    def get_predictions(self):
        """Get predictions for all products"""
        try:
            results = []
            
            for idx, row in self.restock_data.iterrows():
                product_id = row['product_id']
                
                # Restock prediction
                restock_features = [
                    row['current_inventory_level'], row['safety_stock_level'], 
                    row['historical_demand_last_n_days'], row['seasonality_flag'],
                    row['lead_time'], row['production_capacity'], row['batch_size'],
                    row['in_transit_quantity'], row['avg_daily_demand'], 
                    row['demand_variance'], row['demand_std_deviation'],
                    row['forecasted_demand_next_lead_time']
                ]
                
                restock_scaled = self.restock_scaler.transform([restock_features])
                restock_amount = max(0, self.restock_model.predict(restock_scaled)[0])
                
                # Performance prediction
                perf_row = self.performance_data[self.performance_data['product_id'] == product_id].iloc[0]
                perf_features = [
                    perf_row['avg_rating'], perf_row['sentiment_score'], perf_row['units_sold'],
                    perf_row['price'], perf_row['value_score'], perf_row['review_count'],
                    perf_row['return_rate'], perf_row['popularity'], perf_row['competitor_avg_price'],
                    perf_row['feature_gap_score']
                ]
                
                perf_scaled = self.performance_scaler.transform([perf_features])
                performance_score = self.performance_model.predict(perf_scaled)[0]
                
                results.append({
                    'product_id': product_id,
                    'current_stock': int(row['current_inventory_level']),
                    'safety_stock': int(row['safety_stock_level']),
                    'restock_amount': int(round(restock_amount)),
                    'performance_score': round(performance_score, 2),
                    'avg_rating': round(perf_row['avg_rating'], 2),
                    'units_sold': int(perf_row['units_sold']),
                    'return_rate': round(perf_row['return_rate'] * 100, 1),
                    'price': round(perf_row['price'], 2),
                    'in_transit': int(row['in_transit_quantity']),
                    'lead_time': int(row['lead_time']),
                    'forecasted_demand': int(row['forecasted_demand_next_lead_time'])
                })
            
            return results
            
        except Exception as e:
            print(f"Error getting predictions: {e}")
            return []

# Initialize the inventory manager
inventory_manager = InventoryManager()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

@app.route('/api/train', methods=['POST'])
def train_models():
    """Train both models"""
    try:
        if not inventory_manager.load_data():
            return jsonify({'error': 'Failed to load data'}), 400
        
        restock_success = inventory_manager.train_restock_model()
        performance_success = inventory_manager.train_performance_model()
        
        if restock_success and performance_success:
            return jsonify({
                'success': True,
                'message': 'Models trained successfully'
            })
        else:
            return jsonify({'error': 'Failed to train models'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products with predictions"""
    try:
        if inventory_manager.restock_model is None or inventory_manager.performance_model is None:
            return jsonify({'error': 'Models not trained yet'}), 400
        
        products = inventory_manager.get_predictions()
        return jsonify({
            'success': True,
            'products': products,
            'total_products': len(products)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/product/<product_id>', methods=['GET'])
def get_product_details(product_id):
    """Get detailed information for a specific product"""
    try:
        if inventory_manager.restock_model is None or inventory_manager.performance_model is None:
            return jsonify({'error': 'Models not trained yet'}), 400
        
        products = inventory_manager.get_predictions()
        product = next((p for p in products if p['product_id'] == product_id), None)
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
            
        return jsonify({
            'success': True,
            'product': product
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
