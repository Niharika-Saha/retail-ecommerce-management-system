# 🛍️ Retail E-Commerce Management System

## 📘 Project Overview
The **Retail E-Commerce Management System** is a full-stack web application designed to simulate an online shopping platform.  
It enables **customers** to browse and purchase products listed by **sellers**, manage carts, place orders, and make payments securely.  

This project integrates **MySQL (DBMS)**, **Flask (Backend API)**, and **React (Frontend UI)** to provide an end-to-end e-commerce experience.

---

## 👥 Team Members
| Role | Name | SRN |
|------|------|-----|
| Member 1 | **Niharika Paul** | PES1UG23AM189 |
| Member 2 | **Niharika Saha** | PES1UG23AM190 |

---

## 🧩 Mini-World Description
This system models an e-commerce platform where customers can:
- Browse products listed by sellers.
- Add items to a shopping cart.
- Place orders and make payments.
- Track order status and payment updates.

Sellers can:
- List and manage products.
- Update stock availability.
- View order statistics related to their sales.

The database maintains relationships between **customers, sellers, products, carts, orders, and payments**.

---

## 👤 User Roles and Functionalities

### 🧍 Customer
- Register and login/logout.
- Browse or search products by category.
- Add, update, or remove items from the cart.
- Place orders and make payments via **Card / UPI / Cash**.
- Track order and payment status.

### 🧑‍💼 Seller
- Register and login/logout.
- Add, edit, or remove product listings.
- Manage product inventory.
- View sales reports for their products.

---

## 🗂️ Entities (Database Schema Overview)

| Entity | Key Attributes | Description |
|--------|----------------|-------------|
| **Customer** | `CustomerID (PK)` | Customer profile with contact details. |
| **Seller** | `SellerID (PK)` | Seller profile with business details. |
| **Product** | `ProductID (PK)` | Product catalog information. |
| **Cart** | `CartID (PK)` | Stores items before order placement. |
| **CartItem** | `CartItemID (PK), CartID (FK), ProductID (FK), Quantity` | Links specific products to a customer’s cart. |
| **Order** | `OrderID (PK)` | Customer order information. |
| **OrderDetails** | `OrderDetailID (PK)`, `OrderID (FK)`, `ProductID (FK)` | Links products to orders. |
| **Payment** | `PaymentID (PK)` | Tracks payment method, amount, and status. |

---

## ⚙️ Functional Requirements

### ✅ Customer Functions
- Register/login/logout.
- Browse/search for products.
- Add/remove/update items in cart.
- Place orders and make payments.
- View order and payment status.

### ✅ Seller Functions
- Register/login/logout.
- Manage product inventory (CRUD operations).
- View sales and order details.

### ✅ Order & Payment Processing
- Auto-generate IDs for orders, payments, and order details.
- Associate orders with customers and products.
- Record payment transactions (method, date, amount, status).
- Auto-update order status on payment success.

---

## 🧾 Non-Functional Requirements

| Category | Requirement |
|-----------|-------------|
| **Performance** | Supports ≥1000 users, search under 2 seconds. |
| **Scalability** | Easily extensible for more users and products. |
| **Security** | Passwords stored securely, transactions verified. |
| **Availability** | Uptime ≥99.5%. |
| **Usability** | Responsive, intuitive UI for all user roles. |
| **Reliability** | Prevents data loss, rolls back on payment failure. |

---

## 🧠 Technologies Used

| Layer | Technologies |
|--------|---------------|
| **Frontend** | React.js, HTML5, CSS3, JavaScript |
| **Backend** | Flask (Python), Flask-CORS, bcrypt |
| **Database** | MySQL (XAMPP) |
| **Tools** | VS Code, Postman, XAMPP, npm |
| **Version Control** | Git / GitHub |

---

## 🗄️ Database Features

- **Stored Procedures**
  - `sp_place_order()` — Creates a new order and moves cart items to order details.
  - `sp_make_payment()` — Records payment and updates order status to 'Paid'.
- **Functions**
  - `fn_order_subtotal()` — Computes subtotal of an order.
  - `fn_order_discount()` — Applies 5% discount for orders ≥ ₹5000.
  - `fn_order_total()` — Calculates final payable amount.
- **Triggers**
  - Prevent adding more items than available stock.
  - Auto-reduce product stock after order placement.
  - Auto-update order status to 'Paid' after successful payment.

---

## 🖥️ System Architecture
**Frontend (React)** → **Flask REST API** → **MySQL Database**

Each component communicates via RESTful endpoints:
- `/api/auth` → login/register
- `/api/products` → view products
- `/api/cart` → manage cart
- `/api/orders` → place and track orders
- `/api/payments` → record payments

---

## 🚀 Installation and Setup

### 🧩 1. Clone the Repository
```bash
git clone https://github.com/yourusername/RetailEcommerceDBMS.git
cd RetailEcommerceDBMS
