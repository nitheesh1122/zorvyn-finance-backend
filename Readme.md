# Zorvyn Finance Backend

This project was developed as part of a screening assignment for Zorvyn FinTech Pvt. Ltd.
It is not an official product or affiliated repository.

## Overview

Zorvyn Finance Backend is a role-based financial records API built with Node.js, Express, and MongoDB.

The project is organized with a clean layered structure:

- Routes handle URL mapping and middleware chaining.
- Controllers handle request and response flow.
- Services contain core business logic.
- Models define persistence schemas.
- Middleware provides authentication, RBAC, and shared guards.

## Core Project Features

### Authentication

- JWT-based authentication
- Access and refresh token flow
- Password hashing with bcrypt

### Financial Records Management

- Create, read, update, and soft-delete records
- Record fields: amount, type, category, date, notes, createdBy, isDeleted
- User-level data isolation (users can access only their own records)
- Filtering support for type, category, and date range
- Pagination support for list endpoints

### Dashboard APIs

- Summary metrics endpoint (income, expense, balance, record count)
- Category breakdown endpoint with totals and counts
- Date range filters for dashboard analytics

### Role-Based Access Control

- Viewer: dashboard access
- Analyst: dashboard access + records read
- Admin: dashboard access + full record CRUD

### Role Permissions Table

| Endpoint | Viewer | Analyst | Admin |
| --- | --- | --- | --- |
| GET /dashboard/summary | Yes | Yes | Yes |
| GET /dashboard/categories | Yes | Yes | Yes |
| GET /records | No | Yes | Yes |
| POST /records | No | No | Yes |
| PUT /records/:id | No | No | Yes |
| DELETE /records/:id | No | No | Yes |
| GET /auth/me | Yes | Yes | Yes |
| GET /auth/admin | No | No | Yes |

### Security and Reliability

- Helmet for secure HTTP headers
- API rate limiting
- Centralized async error handling
- Consistent JSON response format

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication

## Project Structure

```text
src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  validators/
```

## API Surface

Base URL: /api/v1

### Auth

- POST /auth/register
- POST /auth/login
- POST /auth/refresh

### Protected Utility

- GET /auth/me
- GET /auth/admin

### Dashboard

- GET /dashboard/summary
- GET /dashboard/categories

Optional query params:

- startDate
- endDate
- type (for category endpoint)

### Records

- POST /records
- GET /records
- PUT /records/:id
- DELETE /records/:id

Optional query params for list endpoint:

- type
- category
- startDate
- endDate
- page
- limit

## Request Examples

Use an access token from login in the Authorization header.

### 1) Register

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo User",
    "email": "demo@example.com",
    "password": "password123"
  }'
```

### 2) Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "password123"
  }'
```

### 3) Create Record (Admin)

```bash
curl -X POST http://localhost:5000/api/v1/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "amount": 1200,
    "type": "income",
    "category": "Salary",
    "date": "2026-04-01",
    "notes": "Monthly salary"
  }'
```

### 4) Get Records with Filters (Analyst/Admin)

```bash
curl -X GET "http://localhost:5000/api/v1/records?type=expense&category=Food&startDate=2026-04-01&endDate=2026-04-30&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5) Dashboard Summary

```bash
curl -X GET "http://localhost:5000/api/v1/dashboard/summary?startDate=2026-04-01&endDate=2026-04-30" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6) Category Breakdown

```bash
curl -X GET "http://localhost:5000/api/v1/dashboard/categories?type=expense&startDate=2026-04-01&endDate=2026-04-30" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Setup

1. Clone the repository.
2. Install dependencies.
3. Configure environment variables.
4. Run the server.

```bash
git clone https://github.com/nitheesh1122/zorvyn-finance-backend.git
cd zorvyn-finance-backend
npm install
```

Create a .env file:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/zorvyn_finance
JWT_ACCESS_SECRET=change-this-access-secret
JWT_REFRESH_SECRET=change-this-refresh-secret
```

Start the server:

```bash
npm run dev
```

## Database Seeding

Populate test users for RBAC verification:

```bash
npm run seed
```

Seeded users:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@test.com | 123456 |
| Analyst | analyst@test.com | 123456 |
| Viewer | viewer@test.com | 123456 |

The seed script removes existing users with these emails before creating them again.

## Validation and Testing

- Run lint checks:

```bash
npm run lint
```

- APIs can be verified with Postman for auth, RBAC, records, and dashboard routes.

## Notes

- This repository is focused on clean architecture and maintainable backend structure.
- Soft deletion is used for records instead of permanent delete.

## License

This project is for assessment purposes only.
