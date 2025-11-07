from flask import Blueprint, request, jsonify
from db import get_connection
import bcrypt

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/signup")
def signup():
    data = request.get_json(force=True)
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = (data.get("role") or "customer").lower()

    if not all([name, email, password]):
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    table = "Seller" if role == "seller" else "Customer"
    cur.execute(f"SELECT 1 FROM {table} WHERE Email=%s", (email,))
    if cur.fetchone():
        cur.close(); conn.close()
        return jsonify({"success": False, "message": "Email already registered"}), 409

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    cur.execute(f"INSERT INTO {table} (Name, Email, Password) VALUES (%s, %s, %s)", (name, email, hashed))
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"success": True, "message": "Account created successfully!"})

@auth_bp.post("/login")
def login():
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")
    role = (data.get("role") or "customer").lower()

    if role == "admin":
        if email == "admin@ecommerce.com" and password == "admin123":
            return jsonify({"success": True, "role": "admin", "user": {"Name": "Admin", "Email": email}})
        return jsonify({"success": False, "message": "Invalid admin credentials"}), 401

    table = "Seller" if role == "seller" else "Customer"

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute(f"SELECT * FROM {table} WHERE Email=%s", (email,))
    user = cur.fetchone()
    cur.close(); conn.close()

    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["Password"].encode("utf-8")):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    return jsonify({"success": True, "role": role, "user": user})
