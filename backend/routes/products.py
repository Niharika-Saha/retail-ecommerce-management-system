from flask import Blueprint, jsonify
from db import get_connection

products_bp = Blueprint("products", __name__)

@products_bp.get("/")
def list_products():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT ProductID, SellerID, Name, Description, Price, QuantityAvailable, Category FROM Product")
    rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify(rows)
