import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const onLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">EcommerceDB</Link>
        <div className="nav-actions">
          <Link to="/">Home</Link>
          {user?.CustomerID && <Link to="/cart">Cart</Link>}
          {user?.CustomerID && <Link to="/orders">My Orders</Link>}
          {user?.SellerID && <Link to="/seller">Seller</Link>}
          {!user && <Link to="/login">Login</Link>}
          {!user && <Link to="/signup">Sign Up</Link>}
          {user && <button className="logout-btn" onClick={onLogout}>Logout</button>}
        </div>
      </div>
    </div>
  );
}
