# RegistrarSys — System Integration Plan

## 1. Project Overview

**Project Name:** RegistrarSys — Registrar Management System

**System:** SIA College Management System

**Module:** Registrar

**Repository:** https://github.com/lloydmarcsenoraa-cmyk/SIA_Registrar

RegistrarSys is a Registrar Management System designed to manage student information, academic programs, enrollments, courses, and academic records.

The module provides REST API endpoints that can be used by other modules within the College Management System.

## 2. Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL / MariaDB |
| API Architecture | REST |
| API Documentation | OpenAPI 3.0.3 |
| Version Control | Git and GitHub |

## 3. System Architecture

RegistrarSys follows a client-server architecture.

**Frontend → Express REST API → MySQL Database**

The frontend communicates with the backend through HTTP requests. The backend processes requests, performs database operations, and returns JSON responses.

Other College Management System modules can consume RegistrarSys endpoints through HTTP requests.

## 4. Available REST API Endpoints

**Base URL (Local Development):** `http://localhost:3000`

### System and Programs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api` | Retrieve API information |
| GET | `/api/programs` | Retrieve academic programs |

### Students

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/students` | Retrieve all students |
| POST | `/api/students` | Create a student |
| GET | `/api/students/{id}` | Retrieve student by ID |
| PUT | `/api/students/{id}` | Update student |
| DELETE | `/api/students/{id}` | Delete student |

### Enrollments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/enrollments` | Retrieve all enrollments |
| POST | `/api/enrollments` | Create an enrollment |
| GET | `/api/enrollments/{id}` | Retrieve enrollment by ID |
| PATCH | `/api/enrollments/{id}/status` | Update enrollment status |

### Courses

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses` | Retrieve all courses |
| POST | `/api/courses` | Create a course |
| GET | `/api/courses/{id}` | Retrieve course by ID |
| PUT | `/api/courses/{id}` | Update course |
| DELETE | `/api/courses/{id}` | Delete course |

### Academic Records

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/academic-records` | Retrieve all academic records |
| POST | `/api/academic-records` | Create an academic record |
| GET | `/api/academic-records/{id}` | Retrieve academic record by ID |
| PUT | `/api/academic-records/{id}` | Update academic record |
| DELETE | `/api/academic-records/{id}` | Delete academic record |

## 5. Proposed Integration With Other Modules

The following integrations are proposed for the final College Management System.

| Connected Module | RegistrarSys Endpoint | Purpose |
|---|---|---|
| Student Portal | `GET /api/students` | Retrieve student information |
| Student Portal | `GET /api/enrollments` | Retrieve enrollment information |
| Finance | `GET /api/enrollments` | Support enrollment-related billing |
| Faculty | `GET /api/students` | Retrieve student information |
| Faculty | `GET /api/courses` | Retrieve course information |
| Landing Page | `GET /api/programs` | Display academic programs |

These integrations are planned and will require coordination with the respective module developers.

## 6. Example API Response

**Request:**

`GET http://localhost:3000/api/students`

**Response:**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "studentNumber": "2026-0001",
      "firstName": "Juan",
      "lastName": "Dela Cruz",
      "program": "BSIT",
      "yearLevel": 2,
      "status": "Enrolled"
    }
  ]
}
```

The example shows the response structure. The actual API response contains all matching records.

## 7. Integration Requirements

For successful integration, the following requirements must be addressed:

1. RegistrarSys must be running and accessible to the consuming module.
2. Connected modules must use the correct API base URL.
3. Modules must exchange data using the agreed JSON structure.
4. Cross-origin access must be configured where necessary.
5. API errors must be handled by consuming modules.
6. Student information must be protected through appropriate access controls before deployment.
7. Integration testing must verify that the modules exchange data correctly.

**Important:** `localhost` refers to the computer running the request. Other computers cannot use `http://localhost:3000` to access this backend unless it is running on their own computer.

## 8. Testing and Verification

| Test | Status |
|---|---|
| RegistrarSys frontend navigation | Passed |
| Students GET endpoint | Passed |
| Programs GET endpoint | Passed |
| Enrollments GET endpoint | Passed |
| Courses GET endpoint | Passed |
| Academic Records GET endpoint | Passed |
| Student Create, Update, Delete | Passed |
| Course Create, Update, Delete | Passed |
| Academic Record Create, Update, Delete | Passed |
| Enrollment creation and status update | Pending verification |
| OpenAPI documentation validation | Passed |
| Cross-module integration | Not yet tested |

## 9. API Documentation

The OpenAPI specification is located at:

`server/openapi.yaml`

The documentation follows OpenAPI Specification 3.0.3 and can be viewed using Swagger Editor.

**Swagger Editor:** https://editor.swagger.io/

## 10. Future Integration

RegistrarSys will be prepared for integration into the final College Management System.

The final integration phase will include confirming module ownership, agreeing on API contracts, configuring network access, implementing necessary security controls, and conducting end-to-end integration testing.

## 11. Conclusion

RegistrarSys provides REST API functionality for managing registrar-related information in the SIA College Management System.

The module's core functionality and API documentation have been tested. Integration with other modules remains a planned activity for the final project.