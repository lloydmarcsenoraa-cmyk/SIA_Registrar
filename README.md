# RegistrarSys - Registrar Management System

## Project Overview

RegistrarSys is a Registrar Management System developed as part of the System Integration and Architecture (SIA) College Management System project.

The system manages student information, programs, enrollments, courses, and academic records through a REST API.

For the SIA midterm, RegistrarSys provides a separate mock-data REST API that does not require a database. The existing MySQL-backed implementation is retained for future development.

## Features

- Dashboard and Student Records Management
- Program Management
- Enrollment Management
- Course Management
- Academic Records Management
- REST API with CRUD Operations
- Mock Data for Midterm Testing
- Swagger UI API Documentation
- MySQL Database Integration (Existing Implementation)

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Midterm Data Storage | In-memory JavaScript arrays |
| Existing Database | MySQL / MariaDB |
| API Documentation | OpenAPI, Swagger UI |
| Development Environment | VS Code, XAMPP |
| Version Control | Git and GitHub |
| Prototype | Figma (In Progress) |

## Project Structure

```text
SIA_Registrar/
|-- client/
|   |-- css/
|   |   `-- style.css
|   |-- js/
|   |   `-- app.js
|   `-- index.html
|-- database/
|   `-- registrar_db.sql
|-- server/
|   |-- data/
|   |   `-- mockData.js
|   |-- routes/
|   |   `-- registrarRoutes.js
|   |-- services/
|   |   `-- registrarService.js
|   |-- db.js
|   |-- index.js
|   |-- mockIndex.js
|   |-- openapi.yaml
|   `-- test-db.js
|-- docs/
|   |-- decisions/
|   |   `-- 0001-mock-api.md
|   |-- architecture.md
|   |-- data-model.md
|   |-- design-system.md
|   `-- integration.md
|-- .env.example
|-- .gitignore
|-- API_TEST_RESULTS.md
|-- CONTRIBUTING.md
|-- package.json
|-- package-lock.json
`-- README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/lloydmarcsenoraa-cmyk/SIA_Registrar.git
cd SIA_Registrar
```

### 2. Install dependencies

Make sure Node.js and npm are installed.

```bash
npm install
```

On Windows PowerShell, use `npm.cmd install` if the `npm` command is blocked.

### 3. Start the Midterm Mock API

The mock API does not require MySQL or database configuration.

```bash
node server/mockIndex.js
```

Mock API base URL:

http://localhost:3001/api/v1

Swagger UI:

http://localhost:3001/docs/

Health check:

http://localhost:3001/api/v1/health

Expected health response:

```json
{
  "status": "ok"
}
```

Mock data is stored in memory and resets when the server restarts.

### 4. Set up the database (Existing MySQL Implementation)

1. Start Apache and MySQL in XAMPP.
2. Open `http://localhost/phpmyadmin`.
3. Create a database named `registrar_db`.
4. Import `database/registrar_db.sql`.

This database setup is not required for the midterm mock API.

### 5. Configure environment variables

Copy `.env.example` into a new file named `.env`.

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=registrar_db
PORT=3000
```

Update the database credentials if necessary.

### 6. Test the database connection

```bash
node server/test-db.js
```

### 7. Start the MySQL-backed server

```bash
node server/index.js
```

### 8. Open the existing application

Visit:

http://localhost:3000

The MySQL-backed application and midterm mock API are separate implementations.

## REST API Endpoints

### Midterm Mock API (Port 3001)

All endpoints below use the `/api/v1` prefix.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check API health |
| GET | `/programs` | Retrieve programs |
| GET | `/students` | Retrieve students |
| POST | `/students` | Add a student |
| GET | `/students/:id` | Retrieve a student |
| PUT | `/students/:id` | Update a student |
| DELETE | `/students/:id` | Delete a student |
| GET | `/enrollments` | Retrieve enrollments |
| POST | `/enrollments` | Create an enrollment |
| GET | `/enrollments/:id` | Retrieve an enrollment |
| PATCH | `/enrollments/:id/status` | Update enrollment status |
| GET | `/courses` | Retrieve courses |
| POST | `/courses` | Add a course |
| GET | `/courses/:id` | Retrieve a course |
| PUT | `/courses/:id` | Update a course |
| DELETE | `/courses/:id` | Delete a course |
| GET | `/academic-records` | Retrieve academic records |
| POST | `/academic-records` | Add an academic record |
| GET | `/academic-records/:id` | Retrieve an academic record |
| PUT | `/academic-records/:id` | Update an academic record |
| DELETE | `/academic-records/:id` | Delete an academic record |

For request schemas, response examples, and documented error responses, see Swagger UI at `/docs`.

### Existing MySQL API (Port 3000)

The existing backend uses the `/api` prefix and provides Registrar endpoints for programs, students, enrollments, courses, and academic records.

Its implementation is retained separately from the midterm mock API.

## Database Tables

The existing MySQL implementation uses:

- `students`
- `programs`
- `enrollments`
- `courses`
- `academic_records`

The midterm mock API uses in-memory data instead of these tables.

## System Integration

RegistrarSys serves as the Registrar module of the College Management System.

The module is intended to exchange student, program, enrollment, course, and academic record information with other modules through agreed REST API contracts.

Proposed integration agreements and shared identifiers are documented in `docs/integration.md`.

Cross-module integration testing is still pending.

## Repository

https://github.com/lloydmarcsenoraa-cmyk/SIA_Registrar

Contributing guidelines: [CONTRIBUTING.md](CONTRIBUTING.md)

## Project Status

The RegistrarSys midterm mock API is implemented with Express.js, in-memory data, REST endpoints, and Swagger UI documentation.

The existing MySQL-backed implementation is retained separately.

Architecture, data model,