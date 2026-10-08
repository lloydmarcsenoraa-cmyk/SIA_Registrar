# ADR-0001: Use an In-Memory Mock API for the Midterm

**Status:** Accepted

**Date:** October 8, 2026

## 1. Context

RegistrarSys is part of the SIA College Management System, which consists of multiple independently developed modules.

The midterm requires each module to provide a working REST API using mock data without relying on a database.

RegistrarSys already has a MySQL-backed implementation, but this implementation does not meet the midterm's mock-data-only requirement.

## 2. Decision

We will implement a separate Express.js REST API using in-memory JavaScript arrays.

The mock API will follow this structure:

- `server/mockIndex.js` — Server configuration and entry point
- `server/routes/registrarRoutes.js` — REST endpoints and request validation
- `server/services/registrarService.js` — CRUD operations
- `server/data/mockData.js` — Sample data

All endpoints will use the `/api/v1` prefix.

The API will provide OpenAPI documentation through Swagger UI at `/docs`.

The existing MySQL-backed API will remain available separately for future development.

## 3. Reasons

- Meets the instructor's mock-data-only requirement.
- Allows API testing without MySQL.
- Supports independent development and integration.
- Keeps the existing MySQL implementation intact.
- Makes sample data predictable for testing and demonstration.
- Separates API routes, services, and data storage.

## 4. Consequences

### Positive

- Simple local setup.
- Faster testing and debugging.
- No database credentials or migrations required.
- Easier demonstration of REST API functionality.

### Limitations

- Data resets when the server restarts.
- Data is not shared across separate server instances.
- In-memory storage is unsuitable for production.
- Additional integration and security work will be needed.

## 5. Alternatives Considered

### MySQL Database

The existing MySQL implementation supports persistent data but does not satisfy the mock-data-only midterm requirement.

### JSON File Storage

JSON files could preserve changes between restarts, but in-memory arrays are simpler for the current mock API.

## 6. Future Plans

After the midterm, the team may integrate the existing MySQL backend, introduce authentication and authorization, and connect RegistrarSys to other College Management System modules.

## 7. Decision Outcome

RegistrarSys will use the in-memory mock API for the midterm while retaining the separate MySQL implementation for future development.