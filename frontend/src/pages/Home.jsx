import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { API_BASE } from "../config";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/products/`).then(r => r.json()).then(setProducts).catch(() => alert("Failed to load products."));
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>🌿 Explore Products</h1>
        <div className="grid">
          {products.map(p => <ProductCard key={p.ProductID} product={p} />)}
        </div>
      </div>
    </>
  );
}
