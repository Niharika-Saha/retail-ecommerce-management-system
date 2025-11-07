import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

export default function SellerDashboard() {
  const user = JSON.parse(localStorage.getItem("user")||"null");
  const sellerID = user?.SellerID;
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name:"", description:"", price:"", quantity:"", category:"" });

  const load = async () => {
    const res = await fetch(`${API_BASE}/seller/products/${sellerID}`);
    setProducts(await res.json());
  };

  useEffect(() => { if (sellerID) load(); }, [sellerID]);

  const addProduct = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/seller/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, seller_id: sellerID })
    });
    const data = await res.json();
    if (data.success) { setForm({ name:"", description:"", price:"", quantity:"", category:"" }); load(); }
    else { alert(data.message || "Failed to add product"); }
  };

  const del = async (id) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`${API_BASE}/seller/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: id })
    });
    const data = await res.json();
    if (data.success) load(); else alert("Delete failed");
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>👩‍💼 Seller Dashboard</h1>

        <div className="grid" style={{marginBottom:'1rem'}}>
          <div className="card">
            <h3>Total Products</h3>
            <div style={{fontSize:'1.6rem', fontWeight:800}}>{products.length}</div>
          </div>
          <div className="card">
            <h3>Total Stock</h3>
            <div style={{fontSize:'1.6rem', fontWeight:800}}>
              {products.reduce((a,b)=>a+(b.QuantityAvailable||0),0)}
            </div>
          </div>
        </div>

        <div className="card" style={{marginBottom:'1rem'}}>
          <h3>Add Product</h3>
          <form onSubmit={addProduct}>
            <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
            <input placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} required />
            <input type="number" placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} required />
            <input type="number" placeholder="Quantity" value={form.quantity} onChange={e=>setForm({...form, quantity:e.target.value})} required />
            <input placeholder="Category" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} />
            <button type="submit">Add Product</button>
          </form>
        </div>

        <h2>Your Products</h2>
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Price</th><th>Qty</th><th>Category</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.ProductID}>
                <td>{p.ProductID}</td><td>{p.Name}</td><td>{p.Price}</td><td>{p.QuantityAvailable}</td><td>{p.Category}</td>
                <td><button onClick={()=>del(p.ProductID)}>Delete</button></td>
              </tr>
            ))}
            {products.length===0 && <tr><td colSpan="6">No products yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
