<h1 align="center">EdTech CRM</h1>

<p align="center">
A full-stack CRM application built for educational institutions to streamline lead management, admissions, student records, HR operations, payroll, finance, and administrative workflows.
</p>

<p align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

</p>

---

# Table of Contents

- Overview
- Features
- Tech Stack
- System Architecture
- Project Structure
- Modules
- Installation
- Environment Variables
- Running the Project
- API Overview
- Authentication & Authorization
- Database Design
- Production Deployment
- Security
- Future Improvements
- Contributing
- License

---

# Overview

EdTech CRM is a complete Customer Relationship Management system designed specifically for educational institutions.

The application centralizes academic, administrative, sales, HR, and finance operations into a single platform. It enables institutes to efficiently manage the complete student lifecycle—from lead generation to admission, fee collection, employee management, and reporting.

The project follows a modular architecture that separates responsibilities into independent backend modules while providing a responsive React-based frontend.

---

# Features

### Authentication

- JWT Authentication
- Secure Login
- Refresh Tokens
- Password Encryption
- Protected Routes
- Role-Based Access Control

### Dashboard

- KPI Cards
- Revenue Overview
- Student Statistics
- Lead Statistics
- Attendance Summary
- Payroll Summary

### Lead Management

- Create Leads
- Update Leads
- Lead Status Tracking
- Lead Assignment
- Follow-up Management

### Course Management

- Course Creation
- Batch Management
- Seat Tracking
- Duration Management

### Student Management

- Student Profiles
- Admissions
- Enrollment Tracking
- Academic Records

### Finance

- Invoice Generation
- Payment Tracking
- Fee Collection
- Outstanding Balance

### Human Resources

- Departments
- Designations
- Employee Management
- Attendance
- Leave Management
- Payroll Processing

### Reports

- Revenue Reports
- Student Reports
- Employee Reports
- Attendance Reports

### Notifications

- System Notifications
- Activity Tracking

### Audit Logs

- User Activity
- System Logs
- Administrative Actions

---

# Tech Stack

## Frontend

- React 18
- Vite
- React Router
- Axios
- Chakra UI

## Backend

- Node.js
- Express.js
- JWT Authentication
- Joi Validation

## Database

- MongoDB
- Mongoose ODM

## Cache

- Redis
- In-Memory Redis Fallback (Development)

## Security

- Helmet
- CORS
- Express Rate Limit
- Cookie Parser
- XSS Clean
- Mongo Sanitize

---

# System Architecture

```text
                   React + Vite Client
                           │
                           │ REST API
                           ▼
                  Express.js Backend
                           │
      ┌────────────────────┼────────────────────┐
      ▼                    ▼                    ▼
 MongoDB Atlas         Redis Cache         File Storage
      │
      ▼
 Application Data
```

---

# Project Structure

```text
edtech-crm/

│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── assets/
│   │
│   └── public/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validations/
│   ├── utils/
│   ├── uploads/
│   └── server.js
│
├── package.json
├── README.md
└── .env.example
```

---

# Modules

| Module | Description |
|---------|-------------|
| Authentication | User authentication and authorization |
| Dashboard | KPI cards and analytics |
| Leads | Lead lifecycle management |
| Students | Student records |
| Admissions | Enrollment workflow |
| Courses | Course management |
| Batches | Batch allocation |
| Employees | HR management |
| Departments | Department management |
| Attendance | Employee attendance |
| Leaves | Leave requests |
| Payroll | Salary processing |
| Invoices | Invoice generation |
| Payments | Payment records |
| Reports | Business reports |
| Notifications | User notifications |
| Audit Logs | Activity tracking |
| Settings | Application configuration |

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Aman-Thewhiz/edtech-crm.git

cd edtech-crm
```

---

## Install Dependencies

### Backend

```bash
cd server

npm install
```

### Frontend

```bash
cd client

npm install
```

---

# Environment Variables

Create a `.env` file inside the **server** directory.

```env
PORT=4011

MONGO_URI=your_mongodb_connection_string

REDIS_URL=redis://127.0.0.1:6379

JWT_ACCESS_SECRET=your_access_secret

JWT_REFRESH_SECRET=your_refresh_secret

NODE_ENV=development
```

---

# Running the Project

## Start Backend

```bash
cd server

npm run dev
```

or

```bash
npm start
```

---

## Start Frontend

```bash
cd client

npm run dev
```

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:4011
```

---

# Database

The application uses MongoDB with Mongoose ODM.

Collections include:

- Users
- Leads
- Students
- Admissions
- Courses
- Batches
- Employees
- Attendance
- Leave Requests
- Payroll
- Payments
- Invoices
- Notifications
- Audit Logs
- Settings

---

# API Overview

Base URL

```
/api/v1
```

| Endpoint | Description |
|-----------|-------------|
| /auth | Authentication |
| /dashboard | Dashboard |
| /users | Users |
| /leads | Leads |
| /students | Students |
| /admissions | Admissions |
| /courses | Courses |
| /batches | Batches |
| /employees | Employees |
| /departments | Departments |
| /designations | Designations |
| /attendance | Attendance |
| /leaves | Leave Management |
| /payroll | Payroll |
| /payments | Payments |
| /invoices | Invoices |
| /notifications | Notifications |
| /reports | Reports |
| /audit-logs | Audit Logs |
| /settings | Settings |

---

# Authentication & Authorization

The application implements JWT-based authentication.

Features include:

- Access Tokens
- Refresh Tokens
- Password Hashing
- Protected Routes
- Role-Based Authorization

Supported roles include:

- Super Admin
- Admin
- Counselor
- HR
- Accountant
- Faculty

---

# Production Deployment

## Frontend

Suitable platforms:

- Vercel
- Netlify
- AWS S3 + CloudFront

Build command

```bash
npm run build
```

---

## Backend

Can be deployed on:

- Render
- Railway
- AWS EC2
- DigitalOcean
- Azure App Service

Required environment variables:

- PORT
- MONGO_URI
- REDIS_URL
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- NODE_ENV

---

# Security

Implemented security measures include:

- Helmet
- JWT Authentication
- Password Hashing
- Role-Based Authorization
- Express Rate Limiting
- MongoDB Query Sanitization
- XSS Protection
- HTTP Security Headers
- Cookie Parsing
- Input Validation using Joi

---

# Future Improvements

Potential enhancements include:

- Email Notifications
- SMS Integration
- WhatsApp Integration
- AI Lead Scoring
- LMS Integration
- Payment Gateway Support
- Docker Deployment
- CI/CD Pipeline
- Multi-Tenant Support
- Analytics Dashboard Enhancements

---

# Development Notes

The project follows a modular architecture where each business domain is implemented independently.

Current architecture emphasizes:

- Separation of Concerns
- Reusable Components
- RESTful APIs
- Scalable Folder Structure
- Maintainable Codebase
- Middleware-Based Security

---

# Contributing

Contributions are welcome.

If you would like to improve the project:

1. Fork the repository.
2. Create a new feature branch.

```bash
git checkout -b feature/new-feature
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push your branch.

```bash
git push origin feature/new-feature
```

5. Open a Pull Request.

---

# License

This project is licensed under the MIT License.

---

# Author

**Aman Kumar**

GitHub: https://github.com/Aman-Thewhiz

---

<p align="center">
Made with ❤️ using the MERN Stack
</p>