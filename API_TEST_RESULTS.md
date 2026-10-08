# RegistrarSys â€” API Test Results

## Project Information

- **Module:** Registrar Management System
- **Project:** SIA College Management System
- **Backend:** Node.js / Express
- **Database:** MySQL / MariaDB
- **API Base URL:** `http://localhost:3000`

## Verified Tests

| Test Case | Result |
|---|---|
| MySQL database connection | Passed |
| Database table verification | Passed â€” 5 tables |
| GET `/api/students` | Passed |
| GET `/api/programs` | Passed |
| GET `/api/enrollments` | Passed |
| GET `/api/courses` | Passed |
| GET `/api/academic-records` | Passed |
| Add, Edit, Delete Student through frontend | Passed |
| Add, Edit, Delete Course through frontend | Passed |
| Add, Edit, Delete Academic Record through frontend | Passed |
| Duplicate student number validation | Passed |
| OpenAPI specification validation | Passed |
| Enrollment approval/rejection | Not yet fully verified |
| Cross-module API integration | Not yet tested |

## Test Environment

The tests were performed locally using the RegistrarSys frontend, Express backend, and MySQL database.

## Conclusion

The tested RegistrarSys features operated successfully in the local development environment. Enrollment workflow verification and cross-module integration testing remain pending.
