from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["retailer_db"]
collection = db["retailers"]
contact_collection = db["contacts"]

# ----------------- ROUTES -----------------



@app.route("/signup", methods=["GET"])
def signup_page():
    return render_template("signup.html")

@app.route("/login", methods=["GET"])
def login_page():
    return render_template("login.html")

@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        identifier = data.get("identifier")
        password = data.get("password")

        if not identifier or not password:
            return jsonify({"error": "Identifier and password required"}), 400

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


@app.route("/signup", methods=["POST", "OPTIONS"])
def submit_contact():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight check"}), 200

    try:
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        phone = data.get("phone")
        company = data.get("company")
        password = data.get("password")
        pan = data.get("pan")
        gstr = data.get("gstr")

      
      
        if not name or not email or not phone:
            return jsonify({"error": "Name, Email, and Phone are required"}), 400

        existing = contact_collection.find_one({
            "$or": [{"email": email}, {"phone": phone}]
        })
        if existing:
            return jsonify({"message": "User already registered"}), 200

        result = contact_collection.insert_one({
            "name": name,
            "email": email,
            "phone": phone,
            "company": company,
            "password": password,
            "pan": pan,
            "gstr": gstr
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
