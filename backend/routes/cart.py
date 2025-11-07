from flask import Blueprint, request, jsonify
from db import get_connection

cart_bp = Blueprint("cart", __name__)

@cart_bp.post("/add")
def add_to_cart():
    data = request.get_json(force=True)
    customer_id, product_id, quantity = data["customer_id"], data["product_id"], int(data.get("quantity", 1))

    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    # Get or create an active cart for the user
    cur.execute("SELECT CartID FROM Cart WHERE CustomerID=%s AND Status='Active'", (customer_id,))
    cart = cur.fetchone()
    if cart:
        cart_id = cart["CartID"]
    else:
        cur.execute("INSERT INTO Cart (CustomerID, Status) VALUES (%s, 'Active')", (customer_id,))
        conn.commit()
        cart_id = cur.lastrowid

    # ✅ Check if product already exists in cart
    cur.execute("SELECT Quantity FROM CartItem WHERE CartID=%s AND ProductID=%s", (cart_id, product_id))
    existing = cur.fetchone()

    if existing:
        # ✅ Update quantity instead of inserting new row
        cur.execute("""
            UPDATE CartItem
            SET Quantity = Quantity + %s
            WHERE CartID=%s AND ProductID=%s
        """, (quantity, cart_id, product_id))
    else:
        # Insert new item
        cur.execute("""
            INSERT INTO CartItem (CartID, ProductID, Quantity)
            VALUES (%s, %s, %s)
        """, (cart_id, product_id, quantity))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"success": True})

@cart_bp.get("/get/<int:customer_id>")
def get_cart(customer_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("""
        SELECT ci.CartItemID, p.ProductID, p.Name AS ProductName, p.Price, ci.Quantity
        FROM CartItem ci
        JOIN Cart c ON ci.CartID = c.CartID
        JOIN Product p ON ci.ProductID = p.ProductID
        WHERE c.CustomerID=%s AND c.Status='Active'
    """, (customer_id,))
    rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify(rows)

@cart_bp.post("/remove")
def remove_item():
    data = request.get_json(force=True)
    cart_item_id = data["cart_item_id"]
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM CartItem WHERE CartItemID=%s", (cart_item_id,))
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"success": True})

@cart_bp.post("/update")
def update_cart_item():
    data = request.get_json(force=True)
    customer_id = data["customer_id"]
    product_id = data["product_id"]
    quantity = int(data["quantity"])

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT CartID FROM Cart WHERE CustomerID=%s AND Status='Active'", (customer_id,))
    row = cur.fetchone()
    if not row:
        return jsonify({"success": False, "message": "No active cart found."}), 400

    cart_id = row[0]

    if quantity <= 0:
        cur.execute("DELETE FROM CartItem WHERE CartID=%s AND ProductID=%s", (cart_id, product_id))
    else:
        cur.execute("""
            UPDATE CartItem
            SET Quantity=%s
            WHERE CartID=%s AND ProductID=%s
        """, (quantity, cart_id, product_id))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"success": True})
