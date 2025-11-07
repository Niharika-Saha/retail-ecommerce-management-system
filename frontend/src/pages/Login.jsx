import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = role === "seller" ? "/seller" : "/";
    } else {
      alert(data.message || "Login failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-card">
          <h2>Login</h2>
          <form onSubmit={onSubmit}>
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
            <div className="role-row">
              <label><input type="radio" name="role" value="customer" checked={role==="customer"} onChange={()=>setRole("customer")} /> Customer</label>
              <label><input type="radio" name="role" value="seller" checked={role==="seller"} onChange={()=>setRole("seller")} /> Seller</label>
              {/*<label><input type="radio" name="role" value="admin" checked={role==="admin"} onChange={()=>setRole("admin")} /> Admin</label>*/}
            </div>
            <button type="submit">Login</button>
            <p style={{marginTop:'.5rem'}}>No account? <a href="/signup">Sign up</a></p>
          </form>
        </div>
      </div>
    </>
  );
}
