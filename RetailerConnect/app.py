from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.exceptions import HTTPException

app = Flask(__name__)
CORS(app)

# Correct MongoDB database name (replace 'your_database_name' with your actual DB name)
client = MongoClient("mongodb://localhost:27017/")
db = client["retailer_db"]  # Use the correct database name
collection = db["retailers"]

@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        required_fields = ["name", "phone", "email", "password", "pan", "gstr"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing fields"}), 400

        # Check for existing user by email or phone
        existing_user = collection.find_one({
            "$or": [{"email": data["email"]}, {"phone": data["phone"]}]
        })
        if existing_user:
            return jsonify({"error": "User already exists"}), 409

        # Insert new user
        retailer = {field: data[field] for field in required_fields}
        result = collection.insert_one(retailer)

        return jsonify({
            "message": "Signup successful",
            "retailer_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        print("Server error:", e)
        return jsonify({"error": "Internal server error"}), 500
      

# ----------------- LOGIN ROUTE -----------------
@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        identifier = data.get("identifier")
        password = data.get("password")

        if not identifier or not password:
            return jsonify({"error": "Identifier and password required"}), 400

        # Find by email or phone
        user = collection.find_one({
            "$or": [{"email": identifier}, {"phone": identifier}]
        })

        if not user:
            return jsonify({"error": "User not found"}), 404

        if user["password"] != password:
            return jsonify({"error": "Invalid credentials"}), 401

        return jsonify({
            "message": "Login successful",
            "user_id": str(user["_id"])
        }), 200

    except Exception as e:
        print("Login error:", e)
        return jsonify({"error": "Internal server error"}), 500
    
# Form submit
@app.route("/api/submit", methods=["POST", "OPTIONS"])
def submit_contact():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight check"}), 200

    try:
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")

        if not name or not email:
            return jsonify({"error": "Name and Email are required"}), 400

        contact_collection = db["contacts"]

        existing = contact_collection.find_one({"email": email})
        if existing:
            return jsonify({"message": "Already submitted"}), 200

        result = contact_collection.insert_one({
            "name": name,
            "email": email
        })

        return jsonify({
            "message": "Submission successful",
            "contact_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        print("Submission error:", e)
        return jsonify({"error": "Internal server error"}), 500



# ----------------- RUN APP -----------------
if __name__ == "__main__":
    app.run(debug=True)
