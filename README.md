# 📦 Warehouse Management System

A **full-stack Warehouse Management System** built using **React (Next.js)** for the frontend, **Spring Boot** for the backend, and **MySQL** as the database.
This project provides product inventory management, order processing, stock tracking, and a dashboard with analytics.

---

## 🚀 Tech Stack

### Frontend

* **React (Next.js – App Router)**
* TypeScript
* Axios
* Tailwind CSS
* ShadCN UI
* Recharts (Charts & Analytics)

### Backend

* **Spring Boot**
* Spring Data JPA
* Hibernate
* Java 17

### Database

* **MySQL**

---

## ✨ Features

* User Login (simple authentication)
* Product Management (Add / Edit / Delete)
* Inventory Stock Tracking
* Order Creation & Management
* Automatic Stock Reduction on Order Shipment
* Dashboard with Charts and Analytics
* Protected Routes (Login required)

---

## 🏗️ Project Structure

```
warehouse-management-system/
│
├── frontend/        # React (Next.js) application
│
├── backend/         # Spring Boot application
│
└── database/        # MySQL tables & schema
```

---

## 🖥️ Frontend (React / Next.js)

* Built using **Next.js App Router**
* Uses Axios for API calls
* Tailwind CSS + ShadCN UI for modern UI
* Recharts for dashboard analytics
* Client-side authentication using localStorage

To run frontend:

```bash
npm install
npm run dev
```

---

## ⚙️ Backend (Spring Boot)

* REST APIs built with Spring Boot
* Uses Spring Data JPA + Hibernate
* Clean layered architecture (Controller → Repository → Entity)
* Handles business logic like inventory reduction

To run backend:

```bash
mvn spring-boot:run
```

---

## 🗄️ Database (MySQL)

* MySQL is used for persistent data storage
* Database name and table schemas are provided in the project
* Tables include:

  * `product`
  * `orders`
  * `order_item`
  * `users`

Create database:

```sql
CREATE DATABASE warehouse_db;
```

Update database configuration in:

```
backend/src/main/resources/application.properties
```

---

## 🔗 API Communication

Frontend communicates with backend using REST APIs via Axios.

Example:

```ts
GET /api/products
POST /api/orders
PUT /api/orders/{id}/status
```

---

## 🔐 Authentication

* Simple login authentication
* User data stored in browser localStorage
* Protected pages redirect unauthenticated users to login

*(JWT can be added as a future enhancement)*

---

## 📊 Dashboard Analytics

* Stock Distribution (Pie Chart)
* Order Status Tracking (Bar Chart)
* Inventory Value Calculation
* Low Stock Alerts

---

## 🌱 Future Enhancements

* JWT-based authentication
* Role-based access (Admin/User)
* Pagination & search
* Reports export (PDF/Excel)
* Cloud deployment

---

## 🧑‍💻 Author

Developed as a **full-stack project using React, Spring Boot, and MySQL** for learning and academic purposes.

---

## 📄 License

This project is for educational use.

