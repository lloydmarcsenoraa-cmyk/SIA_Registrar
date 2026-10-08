# RegistrarSys – Registrar Management System

## Project Overview

RegistrarSys is a Registrar Management System developed as part of the System Integration and Architecture (SIA) College Management System project.

The system manages student information, enrollments, courses, and academic records through a web-based interface connected to a REST API and MySQL database.

## Features

- Dashboard
- Student Records Management
- Enrollment Management
- Course Management
- Academic Records Management
- REST API Integration
- MySQL Database Storage

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL / MariaDB |
| Development Environment | VS Code, XAMPP |
| Version Control | Git and GitHub |

## Project Structure

```text
SIA_Registrar/
├── client/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── database/
│   └── registrar_db.sql
├── server/
│   ├── db.js
│   ├── index.js
│   └── test-db.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
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

### 3. Set up the database

1. Start Apache and MySQL in XAMPP.
2. Open `http://localhost/phpmyadmin`.
3. Create a database named `registrar_db`.
4. Import `database/registrar_db.sql`.

### 4. Configure environment variables

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

### 5. Test the database connection

```bash
node server/test-db.js
```

### 6. Start the server

```bash
node server/index.js
```

### 7. Open the application

Visit:

http://localhost:3000

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api` | API information |
| GET | `/api/programs` | Retrieve programs |
| GET | `/api/students` | Retrieve students |
| POST | `/api/students` | Add a student |
| GET | `/api/students/:id` | Retrieve a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |
| GET | `/api/enrollments` | Retrieve enrollments |
| POST | `/api/enrollments` | Create enrollment |
| GET | `/api/enrollments/:id` | Retrieve enrollment |
| PATCH | `/api/enrollments/:id/status` | Update enrollment status |
| GET | `/api/courses` | Retrieve courses |
| POST | `/api/courses` | Add a course |
| PUT | `/api/courses/:id` | Update a course |
| DELETE | `/api/courses/:id` | Delete a course |
| GET | `/api/academic-records` | Retrieve academic records |
| POST | `/api/academic-records` | Add an academic record |
| PUT | `/api/academic-records/:id` | Update an academic record |
| DELETE | `/api/academic-records/:id` | Delete an academic record |

## Database Tables

- `students`
- `programs`
- `enrollments`
- `courses`
- `academic_records`

## System Integration

RegistrarSys serves as the Registrar module of the College Management System. Its REST API is intended to support integration with other modules through student, enrollment, course, and academic record data.

## Repository

https://github.com/lloydmarcsenoraa-cmyk/SIA_Registrar

## Project Status

The Registrar module includes a web frontend, Express REST API, and MySQL database integration. Cross-module integration is subject to testing with the other College Management System modules.
