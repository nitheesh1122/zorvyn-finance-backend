# Zorvyn Finance Backend

This project was developed as part of a screening assignment for **Zorvyn FinTech Pvt. Ltd.**
It is not an official product or affiliated repository.

---

## 🚀 Overview

A backend system for managing financial records with secure authentication, role-based access control, and analytics APIs.

The system is designed with a clean architecture using controllers, services, and middleware.

---

## 🧠 Features

### 🔐 Authentication

* JWT-based authentication (Access + Refresh tokens)
* Secure password hashing using bcrypt
* Token refresh mechanism

### 🔒 Role-Based Access Control (RBAC)

* Viewer → Dashboard access only
* Analyst → Dashboard + read access to records
* Admin → Dashboard + full record CRUD

### 🛡️ Security

* Helmet for secure headers
* Rate limiting
* Input validation
* Global error handling

### 📊 APIs (Current)

* User registration & login
* Token refresh
* Protected routes
* Financial records CRUD with filters and pagination
* Dashboard summary and category analytics

---

## 🛠 Tech Stack

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication

---

## 📁 Project Structure

```
src/
  config/
  models/
  controllers/
  services/
  routes/
  middleware/
  validators/
  utils/
```

---

## 📦 API Endpoints

### 🔐 Auth

* POST /api/v1/auth/register
* POST /api/v1/auth/login
* POST /api/v1/auth/refresh

### 🔒 Protected

* GET /api/v1/auth/me
* GET /api/v1/auth/admin

### 📈 Dashboard

* GET /api/v1/dashboard/summary?startDate=&endDate=
* GET /api/v1/dashboard/categories?type=&startDate=&endDate=

### 💰 Records

* POST /api/v1/records
* GET /api/v1/records?type=&category=&startDate=&endDate=&page=&limit=
* PUT /api/v1/records/:id
* DELETE /api/v1/records/:id

### 👥 Role Matrix

* Viewer → Dashboard endpoints only
* Analyst → Dashboard + GET records
* Admin → Dashboard + full record CRUD

---

## ⚙️ Setup Instructions

1. Clone the repository

```
git clone https://github.com/nitheesh1122/zorvyn-finance-backend.git
cd zorvyn-finance-backend
```

2. Install dependencies

```
npm install
```

3. Create `.env` file

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

4. Run the server

```
npm run dev
```

---

## 🧪 Testing

APIs were tested using Postman.

* Register user
* Login user
* Refresh token
* Test protected routes
* Test RBAC (viewer vs analyst vs admin)
* Test records filters and pagination
* Test dashboard aggregation endpoints

---

## 📌 Notes

* Focused on clean backend architecture and secure API design
* Error handling ensures consistent JSON responses
* Designed for scalability and maintainability

---

## 📄 License

This project is for assessment purposes only.
