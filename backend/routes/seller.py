from flask import Blueprint, request, jsonify
from db import get_connection

seller_bp = Blueprint("seller", __name__)

@seller_bp.get("/products/<int:seller_id>")
def seller_products(seller_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM Product WHERE SellerID=%s", (seller_id,))
    rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify(rows)

@seller_bp.post("/add")
def add_product():
    data = request.get_json(force=True)
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO Product (SellerID, Name, Description, Price, QuantityAvailable, Category) VALUES (%s, %s, %s, %s, %s, %s)",
        (data["seller_id"], data["name"], data["description"], data["price"], data["quantity"], data["category"])
    )
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"success": True})

@seller_bp.post("/delete")
def delete_product():
    data = request.get_json(force=True)
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM Product WHERE ProductID=%s", (data["product_id"],))
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"success": True})
