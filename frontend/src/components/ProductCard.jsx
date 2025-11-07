import React, { useState, useEffect } from "react";
import { API_BASE } from "../config";

export default function ProductCard({ product }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [quantity, setQuantity] = useState(0);

  // ✅ Load existing quantity (when customer revisits)
  useEffect(() => {
    if (!user?.CustomerID) return;
    fetch(`${API_BASE}/cart/get/${user.CustomerID}`)
      .then((res) => res.json())
      .then((items) => {
        const match = items.find((i) => i.ProductID === product.ProductID);
        if (match) setQuantity(match.Quantity);
      })
      .catch(() => {});
  }, [user, product.ProductID]);

  // ✅ Add first item
  const addToCart = async () => {
    if (!user?.CustomerID) {
      alert("Please log in as a customer to add to cart.");
      return;
    }

    const res = await fetch(`${API_BASE}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: user.CustomerID,
        product_id: product.ProductID,
        quantity: 1,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setQuantity(1);
    } else {
      alert(data.message || "Failed to add to cart");
    }
  };

  // ✅ Update quantity
  const updateQuantity = async (newQty) => {
    if (newQty < 0) return;

    const res = await fetch(`${API_BASE}/cart/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: user.CustomerID,
        product_id: product.ProductID,
        quantity: newQty,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setQuantity(newQty);
    } else {
      alert(data.message || "Failed to update cart");
    }
  };

  return (
    <div className="card">
      <h3>{product.Name}</h3>
      <p>{product.Description}</p>
      <p className="price">₹{product.Price}</p>
      <p className="stock">
        {product.QuantityAvailable > 0
          ? `In Stock (${product.QuantityAvailable})`
          : "Out of Stock"}
      </p>

      {product.QuantityAvailable <= 0 ? (
        <button disabled>Unavailable</button>
      ) : quantity === 0 ? (
        <button onClick={addToCart}>Add to Cart</button>
      ) : (
        <div className="quantity-controls">
          <button onClick={() => updateQuantity(quantity - 1)}>−</button>
          <span>{quantity}</span>
          <button onClick={() => updateQuantity(quantity + 1)}>+</button>
        </div>
      )}
    </div>
  );
}
