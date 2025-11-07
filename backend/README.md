# EcommerceDB Flask Backend

This is a ready-to-run Flask backend for your existing **MySQL EcommerceDB** (with procedures & triggers).

## Quick Start

1. **Edit DB password** (if any) in `db.py` or set env vars:
   ```bash
   set DB_PASS=your_mysql_password
   ```

2. **Install deps**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run**
   ```bash
   python app.py
   ```

API will be at: `http://localhost:5000/api/...`

## Endpoints

- `GET /api/products/` — list all products
- `POST /api/cart/add` — { customer_id, product_id, quantity }
- `GET /api/cart/get/<customer_id>` — active cart items
- `POST /api/cart/remove` — { cart_item_id }
- `POST /api/orders/place` — { customer_id } → calls `sp_place_order`
- `GET /api/orders/history/<customer_id>` — orders + payments
- `POST /api/payments/` — { customer_id, amount, method } → calls `sp_make_payment`
- `GET /api/seller/products/<seller_id>` — seller's products
- `POST /api/seller/add` — { seller_id, name, description, price, quantity, category }
- `POST /api/seller/delete` — { product_id }
- `POST /api/auth/signup` — { name, email, password, role }
- `POST /api/auth/login` — { email, password, role }

## Notes
- Uses your DB triggers & procedures for stock updates and order status.
- Change port or host in `app.py` if needed.
