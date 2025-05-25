from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Sample product data
products = [
    {
        "id": 1,
        "name": "Wireless Mouse",
        "price": 25.99,
        "image": "https://via.placeholder.com/150",
        "description": "Smooth and ergonomic wireless mouse"
    },
    {
        "id": 2,
        "name": "Mechanical Keyboard",
        "price": 75.49,
        "image": "https://via.placeholder.com/150",
        "description": "Tactile mechanical keyboard with RGB"
    },
    {
        "id": 3,
        "name": "USB-C Charger",
        "price": 19.99,
        "image": "https://via.placeholder.com/150",
        "description": "Fast charging USB-C wall adapter"
    },
    {
        "id": 4,
        "name": "Noise Cancelling Headphones",
        "price": 129.99,
        "image": "https://via.placeholder.com/150",
        "description": "Over-ear noise cancelling Bluetooth headphones"
    }
]

# Endpoint to fetch products
@app.route('/products', methods=['GET'])
def get_products():
    return jsonify(products)

# Mock add-to-cart endpoint
@app.route('/add-to-cart', methods=['POST'])
def add_to_cart():
    data = request.get_json()
    print("Add to cart:", data)
    return jsonify({"message": "Item added to cart"})

# Mock checkout endpoint
@app.route('/checkout', methods=['POST'])
def checkout():
    data = request.get_json()
    print("Checkout items:", data.get("items", []))
    return jsonify({"message": "Checkout successful"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
