import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

export default function Payment() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();
  const navigate = useNavigate();

  const passedAmount = Number(location.state?.amount || 0);   // ✅ from Cart
  const [method, setMethod] = useState("Card");
  const [loading, setLoading] = useState(false);

  // ✅ if opened directly without cart, send back
  useEffect(() => {
    if (!passedAmount) {
      alert("No order amount found. Please go to your cart first.");
      navigate("/cart");
    }
  }, [passedAmount, navigate]);

  const pay = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to continue.");
      return;
    }

    try {
      setLoading(true);
      const r = await fetch(`${API_BASE}/payments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: user.CustomerID,
          // backend now uses DB total, but we send this for reference
          amount: passedAmount,
          method,
        }),
      });

      const d = await r.json();
      setLoading(false);

      if (r.ok && d.success) {
        alert("✅ Payment successful! Your order has been placed.");
        localStorage.removeItem("cart");
        window.location.href = "/orders?success=true";
      } else {
        alert(`❌ ${d.message || "Payment failed. Please try again."}`);
      }
    } catch (err) {
      setLoading(false);
      console.error("Payment error:", err);
      alert("⚠️ An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-card">
          <h2>💳 Complete Payment</h2>
          <form onSubmit={pay}>
            {/* ✅ Display amount instead of asking user to type it */}
            <div style={{ marginBottom: "1rem", fontWeight: 600 }}>
              Amount to pay: ₹{passedAmount.toFixed(2)}
            </div>

            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="bg-[var(--viridian)] hover:bg-[var(--cambridge-blue)] text-[var(--mint-cream)] px-4 py-2 rounded"
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </form>

          {loading && (
            <p className="text-center text-gray-600 mt-2">
              Processing payment... please wait ⏳
            </p>
          )}
        </div>
      </div>
    </>
  );
}
