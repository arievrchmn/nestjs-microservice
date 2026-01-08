# NestJS Microservice - Employee Attendance System

An employee attendance system built with microservice architecture using NX and NestJS.

## 🏗️ Architecture Overview

```
┌─────────────┐
│   Clients   │
│ (Web/Mobile)│
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│ API Gateway │──> RabbitMQ ──┐
└─────────────┘               ├──> User Service
                              ├──> Auth Service
                              ├──> Attendance Service
                              └──> Log Service
```

Microservice architecture with:

- **API Gateway** as single entry point
- **RabbitMQ + TCP** for inter-service communication
- **Shared database** for development ease (to be split per service)
- **Prisma ORM** for database access
- **Firebase** for push notifications

## 🛠️ Tech Stack

- **Framework**: NestJS 11
- **Monorepo**: Nx
- **Message Broker**: RabbitMQ (via @nestjs/microservices)
- **Database**: MySQL/MariaDB
- **ORM**: Prisma 7
- **Authentication**: JWT
- **Notifications**: Firebase Admin SDK
- **Language**: TypeScript

## 📁 Project Structure

```
nestjs-microservice/
├── apps/
│   ├── api-gateway/          # HTTP entry point, routes to services
│   ├── user-service/         # User management (CRUD, profiles)
│   ├── auth-service/         # Authentication & authorization
│   ├── attendance-service/   # Check-in/out, attendance tracking
│   └── log-service/          # Activity logging with MongoDB
├── libs/
│   ├── shared/               # Shared Prisma schema, DTOs, types
│   └── firebase/             # Firebase notification utilities
└── prisma/
    └── schema.prisma         # Shared database schema
```

## 🎯 Services

### API Gateway

- Entry point for all HTTP requests
- Routes to microservices via RabbitMQ
- Authentication guard & role-based access control
- Endpoints: `/auth`, `/staff`, `/admin`

### User Service

- User CRUD operations
- Profile management
- Employee data
- Pattern: `user.*`

### Auth Service

- Login & JWT token generation
- Token validation
- Password hashing with bcrypt
- Pattern: `auth.*`

### Attendance Service

- Check-in/check-out functionality
- Daily attendance tracking
- Attendance summary & reports
- Date-based filtering
- Pattern: `attendance.*`

### Log Service

- Activity logging with MongoDB
- Audit trail for all operations
- Firebase push notifications
- Pattern: `log.*`

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MySQL/MariaDB
- MongoDB (for log-service)
- RabbitMQ

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate --schema=libs/shared/prisma/schema.prisma

# Run database migrations
npx prisma migrate dev --schema=libs/shared/prisma/schema.prisma
```

### Environment Variables

Each service requires environment variables:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_NAME=attendance_db

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# JWT (auth-service)
JWT_SECRET=your-secret-key

# MongoDB (log-service)
MONGODB_URI=mongodb://localhost:27017/logs
```

### Running Services

```bash
# Run specific service
npx nx serve api-gateway
npx nx serve user-service
npx nx serve auth-service
npx nx serve attendance-service
npx nx serve log-service

# Build all
npx nx run-many -t build
```

## 📚 API Endpoints

### Authentication

```
POST /auth/login                    # Login
POST /auth/register                 # Register (staff)
```

### Staff Endpoints

```
GET  /staff/profile                 # Get own profile
PUT  /staff/profile                 # Update own profile
GET  /staff/attendance/today        # Today's attendance
POST /staff/attendance/check-in     # Check in
POST /staff/attendance/check-out    # Check out
GET  /staff/attendance/summary      # Attendance history
```

### Admin Endpoints

```
GET    /admin/employees             # List all employees
POST   /admin/employees             # Create employee
GET    /admin/employees/:id         # Get employee detail
PATCH  /admin/employees/:id         # Update employee
DELETE /admin/employees/:id         # Delete employee
GET    /admin/attendances           # All attendances with filters
```

## 🔐 Authentication

All endpoints (except `/auth/login` and `/auth/register`) require JWT token:

```bash
Authorization: Bearer <jwt-token>
```

Role-based access:

- `STAFF`: Access to `/staff/*` endpoints
- `ADMIN`: Access to `/admin/*` and `/staff/*` endpoints

## 📝 Database Schema

```prisma
model User {
  id          Int       @id @default(autoincrement())
  email       String    @unique
  password    String
  role        UserRole  @default(STAFF)
  name        String
  phone       String?
  position    String
  attendances Attendance[]
}

model Attendance {
  id         Int       @id @default(autoincrement())
  user_id    Int
  date       DateTime
  check_in   DateTime?
  check_out  DateTime?
  user       User      @relation(fields: [user_id], references: [id])
}

enum UserRole {
  STAFF
  ADMIN
}
```
