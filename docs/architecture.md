@'
# RegistrarSys - System Architecture

## 1. Overview

RegistrarSys is the Registrar module of the SIA College Management System.

It manages student information, academic programs, courses, enrollments, and academic records.

For the midterm, RegistrarSys uses an Express.js REST API with in-memory mock data. The module does not require a database to run.

The existing MySQL implementation is retained separately for future development.

## 2. Technology Stack

| Component | Technology |
|---|---|
| Backend | Node.js and Express.js |
| API Style | REST |
| API Version | v1 |
| Data Storage | In-memory JavaScript arrays |
| API Documentation | OpenAPI 3.0.3 and Swagger UI |
| UI Prototype | Figma (planned) |
| Version Control | Git and GitHub |

## 3. System Architecture

```mermaid
flowchart TD
    A[Registrar Figma Prototype] --> B[API Contract]
    B --> C[Express REST API]
    C --> D[Routes]
    D --> E[Services]
    E --> F[Mock Data Arrays]
    C --> G[Problem Details Errors]
    H[Swagger UI] --> C