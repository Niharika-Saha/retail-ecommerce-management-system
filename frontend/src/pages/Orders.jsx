import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

export default function Orders() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Move queryParams and success *inside* the component
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const success = queryParams.get("success");

    if (success === "true") {
      alert("🎉 Your payment was successful and order has been placed!");
    }
  }, []);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const r = await fetch(`${API_BASE}/orders/history/${user.CustomerID}`);
      const d = await r.json();

      // Sort newest first
      const sorted = Array.isArray(d)
        ? d.sort(
            (a, b) => new Date(b.OrderDate).getTime() - new Date(a.OrderDate).getTime()
          )
        : [];
      setOrders(sorted);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <Navbar />
      <div className="page">
        <h2>🧾 Your Orders</h2>

        {loading ? (
          <p>Loading your orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="orders-list">
            {orders.map((o) => (
              <div
                key={o.OrderID}
                className="order-card border border-[var(--mint-green)] bg-[var(--mint-cream)] rounded-xl shadow p-4 my-2"
              >
                <p className="font-semibold text-[var(--viridian)]">
                  Order #{o.OrderID}
                </p>
                <p>Status: <b>{o.OrderStatus}</b></p>
                <p>Total: ₹{o.TotalAmount}</p>
                <p>
                  Payment: <b>{o.PaymentMethod}</b> ({o.PaymentStatus})
                </p>
                <p>Items: {o.Items}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
