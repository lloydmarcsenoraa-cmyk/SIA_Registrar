# Contributing to RegistrarSys

Thank you for contributing to RegistrarSys, the Registrar module of the SIA College Management System.

## 1. Development Workflow

All contributors should follow the GitHub feature-branch workflow.

1. Pull the latest changes from the main branch.
2. Create a feature branch for the task.
3. Implement and test the changes.
4. Commit changes using meaningful commit messages.
5. Push the feature branch to GitHub.
6. Open a Pull Request (PR).
7. Request a review from a teammate.
8. Merge the PR only after review and approval.

Do not push directly to the main branch.

## 2. Branch Naming

Use descriptive branch names.

Examples:

- `feat/registrar-mock-api`
- `feat/student-management`
- `docs/api-documentation`
- `fix/enrollment-validation`

## 3. Commit Messages

Use clear and meaningful commit messages.

Examples:

- `feat: add registrar mock API`
- `feat: implement student CRUD`
- `docs: update OpenAPI specification`
- `docs: add architecture documentation`
- `fix: improve request validation`

## 4. Project Structure

The RegistrarSys mock API uses the following structure:

```text
server/
  mockIndex.js
  openapi.yaml
  routes/
    registrarRoutes.js
  services/
    registrarService.js
  data/
    mockData.js
```

## 5. API Development Standards

- Use the `/api/v1` prefix for all mock API endpoints.
- Follow REST conventions.
- Validate request data.
- Use appropriate HTTP status codes.
- Return Problem Details JSON for errors.
- Update `server/openapi.yaml` when endpoints change.
- Keep routes, services, and mock data separated.
- Do not introduce database dependencies into the midterm mock API.

## 6. Testing

Before opening a Pull Request:

1. Verify that the server starts successfully.
2. Test the affected endpoints.
3. Test valid and invalid requests.
4. Confirm that Swagger UI works at `/docs`.
5. Check the OpenAPI specification for errors.

## 7. Documentation

Keep the following files updated when relevant:

- `README.md`
- `server/openapi.yaml`
- `docs/architecture.md`
- `docs/data-model.md`
- `docs/integration.md`
- `docs/design-system.md`
- `docs/decisions/`

## 8. Pull Request Requirements

Each Pull Request should include:

- A clear description of the changes.
- A summary of testing performed.
- Screenshots when UI or documentation changes are involved.
- Any known limitations.

At least one teammate should review the Pull Request before merging.

## 9. Integration Guidelines

RegistrarSys must communicate with other College Management System modules through agreed API contracts.

Changes affecting shared identifiers, endpoints, or response formats should be discussed with the relevant module teams before merging.