from flask import Blueprint, request, jsonify
from db import get_connection

orders_bp = Blueprint("orders", __name__)

@orders_bp.post("/place")
def place_order():
    data = request.get_json(force=True)
    customer_id = data["customer_id"]
    conn = get_connection()
    cur = conn.cursor()
    cur.callproc("sp_place_order", [customer_id])
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"success": True})

@orders_bp.get("/history/<int:customer_id>")
def order_history(customer_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("""
        SELECT 
            o.OrderID, o.OrderDate, o.TotalAmount, o.Status AS OrderStatus,
            COALESCE(MAX(p.Method), '-') AS PaymentMethod,
            COALESCE(MAX(p.Status), 'Pending') AS PaymentStatus,
            GROUP_CONCAT(CONCAT(od.Quantity, ' × ', pr.Name) SEPARATOR ', ') AS Items
        FROM `Order` o
        LEFT JOIN Payment p ON o.OrderID=p.OrderID
        LEFT JOIN OrderDetails od ON o.OrderID=od.OrderID
        LEFT JOIN Product pr ON od.ProductID=pr.ProductID
        WHERE o.CustomerID=%s
        GROUP BY o.OrderID, o.OrderDate, o.TotalAmount, o.Status
        ORDER BY o.OrderDate DESC
    """, (customer_id,))
    rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify(rows)
