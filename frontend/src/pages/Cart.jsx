import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";
import { useNavigate } from "react-router-dom";   // ✅ added

export default function Cart() {
  const user = JSON.parse(localStorage.getItem("user")||"null");
  const [items, setItems] = useState([]);
  const navigate = useNavigate();                // ✅ added

  const load = async () => {
    const res = await fetch(`${API_BASE}/cart/get/${user.CustomerID}`);
    setItems(await res.json());
  };

  useEffect(()=>{ load(); },[]);

  const removeItem = async (id) => {
    await fetch(`${API_BASE}/cart/remove`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({cart_item_id:id}) });
    load();
  };

  const total = items.reduce((s,i)=>s + i.Price * i.Quantity, 0);

  // ✅ changed: no backend call, just go to payment with total
  const checkout = () => {
    if (!items.length) return;
    navigate("/payment", { state: { amount: total } });
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>🛒 Your Cart</h2>
        <table className="table">
          <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i.CartItemID}>
                <td>{i.ProductName}</td>
                <td>₹{i.Price}</td>
                <td>{i.Quantity}</td>
                <td>₹{i.Price * i.Quantity}</td>
                <td><button onClick={()=>removeItem(i.CartItemID)}>Remove</button></td>
              </tr>
            ))}
            {items.length===0 && <tr><td colSpan="5">Your cart is empty.</td></tr>}
          </tbody>
        </table>
        <h3>Total: ₹{total}</h3>
        <button onClick={checkout} disabled={!items.length}>Proceed to Payment</button>
      </div>
    </>
  );
}
