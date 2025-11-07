import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (data.success) { alert("Signup successful!"); window.location.href="/login"; }
    else { alert(data.message || "Signup failed"); }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-card">
          <h2>Create Account</h2>
          <form onSubmit={onSubmit}>
            <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
            <div className="role-row">
              <label><input type="radio" name="role" value="customer" checked={role==="customer"} onChange={()=>setRole("customer")} /> Customer</label>
              <label><input type="radio" name="role" value="seller" checked={role==="seller"} onChange={()=>setRole("seller")} /> Seller</label>
            </div>
            <button type="submit">Sign Up</button>
            <p style={{marginTop:'.5rem'}}>Have an account? <a href="/login">Login</a></p>
          </form>
        </div>
      </div>
    </>
  );
}
