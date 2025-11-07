from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

@app.route("/")
def root():
    return {"message": "Flask backend is running ✅"}

# Blueprints
from routes.auth import auth_bp
from routes.products import products_bp
from routes.cart import cart_bp
from routes.orders import orders_bp
from routes.payments import payments_bp
from routes.seller import seller_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(products_bp, url_prefix="/api/products")
app.register_blueprint(cart_bp, url_prefix="/api/cart")
app.register_blueprint(orders_bp, url_prefix="/api/orders")
app.register_blueprint(payments_bp, url_prefix="/api/payments")
app.register_blueprint(seller_bp, url_prefix="/api/seller")

@app.get("/api/health")
def health():
    return {"ok": True}

if __name__ == "__main__":
    app.run(debug=True, port=5000)
