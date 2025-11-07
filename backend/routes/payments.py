from flask import Blueprint, request, jsonify
from db import get_connection

payments_bp = Blueprint("payments", __name__)

@payments_bp.post("/")
def make_payment():
    conn = None
    cur = None
    try:
        data = request.get_json(force=True)
        customer_id = data["customer_id"]
        method = data["method"]
        # amount from frontend is ignored; DB is source of truth

        conn = get_connection()

        # normal dictionary cursor is fine; we'll drain all results
        cur = conn.cursor(dictionary=True)

        # ✅ Step 1: call stored procedure correctly
        # this is equivalent to: CALL sp_place_order(customer_id);
        cur.callproc("sp_place_order", (customer_id,))

        # sp_place_order should end with:
        #   SELECT v_order_id AS NewOrderID, v_total AS TotalAmount;
        # read the first result set and *fully consume* it
        order_row = None
        for result in cur.stored_results():
            order_row = result.fetchone()   # row with NewOrderID, TotalAmount
            # drain any remaining rows just in case
            for _ in result:
                pass
            break

        conn.commit()

        if not order_row:
            raise Exception("Order could not be created from sp_place_order().")

        order_id = order_row.get("NewOrderID")
        amount = order_row.get("TotalAmount")

        if order_id is None:
            raise Exception("Order ID not returned from sp_place_order.")
        if amount is None:
            amount = 0

        # ✅ Step 2: record payment with DB-calculated amount
        cur.execute("""
            INSERT INTO Payment (OrderID, Amount, Method, Status)
            VALUES (%s, %s, %s, 'Success')
        """, (order_id, amount, method))

        # ✅ Step 3: mark order as Paid
        cur.execute("""
            UPDATE `Order`
            SET Status = 'Paid'
            WHERE OrderID = %s
        """, (order_id,))

        # ✅ Step 4: mark active cart as Ordered
        cur.execute("""
            UPDATE Cart
            SET Status = 'Ordered'
            WHERE CustomerID = %s AND Status = 'Active'
        """, (customer_id,))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Payment successful. Order placed!",
            "order_id": order_id,
            "amount": float(amount),
        })

    except Exception as e:
        print("Payment error:", e)

        if cur is not None:
            try:
                cur.close()
            except:
                pass
        if conn is not None:
            try:
                conn.close()
            except:
                pass

        return jsonify({
            "success": False,
            "message": f"Server error during payment: {str(e)}"
        }), 500
