---
description: 'Node.js/Express/GraphQL backend development standards and best practices'
applyTo: 'apps/backend/**/*.ts'
---

# Backend Development Instructions

Instructions for building high-quality backend services with Node.js, Express, GraphQL, and TypeScript following modern patterns, best practices, and dependency injection.

## Coding standards
- Use JavaScript with ES2022 features and Node.js (20+) ESM modules]
- Use Node.js built-in modules and avoid external dependencies where possible
- Ask the user if you require any additional dependencies before adding them
- Always use async/await for asynchronous code, and use 'node:util' promisify function to avoid callbacks
- Keep the code simple and maintainable
- Use descriptive variable and function names
- Do not add comments unless absolutely necessary, the code should be self-explanatory

## Documentation
- When adding new features or making significant changes, update the README.md file where necessary

## User interactions
- Ask questions if you are unsure about the implementation details, design choices, or need clarification on the requirements
- Suggest improvements or alternatives if you believe there is a better way to implement a feature or solve a problem

## Project Context
- TypeScript for type safety and maintainable code
- GraphQL API with Apollo Server and TypeGraphQL
- PostgreSQL database with Knex.js for queries and migrations
- Dependency Injection using tsyringe container
- JWT-based authentication with role-based access control

## Development Standards
- Follow the dependency injection pattern using tsyringe
- Use interfaces for all data sources and implementations
- Implement postgres and mock data sources for database interface

### Architecture
- Implement GraphQL resolvers using TypeGraphQL decorators
- Try to keep business logic separate into mutations and queries layers
- Use express middleware for cross-cutting concerns
- Structure the codebase by domain and responsibility
- Follow clean architecture principles with clear separation of concerns

### TypeScript Integration
- Use TypeScript interfaces for models, inputs, and return types
- Use strict mode in `tsconfig.json` for type safety
- Avoid any type when possible to ensure type safety

### GraphQL Schema Design
- Use TypeGraphQL decorators to define schema types
- Follow GraphQL naming conventions
- Implement proper input validation using Yup schemas
- Design clear, consistent, and well-documented APIs
- Use meaningful resolver and query/mutation names
- Structure resolvers by domain

### Database Access
- Implement the repository pattern via DataSource interfaces
- Use Knex.js for database queries and transactions
- Minimize raw SQL queries in favor of query builders
- Write proper SQL queries with parameterized inputs
- Handle database errors and connection issues properly
- Implement proper transaction management for multi-step operations
- Use database migrations for schema changes in `/db_patches` directory

### Authentication & Authorization
- Use JWT tokens for authentication
- Implement role-based access control
- Check permissions in resolvers or service methods
- Support multiple authentication methods (local, external)
- Never expose sensitive information in responses
- Unauthorized query requets should return null, not throw error

### Dependency Injection
- Register all services and data sources in the DI container
- Use token-based dependency resolution
- Mock dependencies for unit testing
- Follow the inversion of control principle
- Use constructor injection when possible

### Error Handling
- Create consistent error responses using GraphQL errors
- Use custom rejection types for domain-specific errors
- Log errors with proper context information
- Handle async errors with try/catch
- Return meaningful error messages to clients
- Handle errors in mutation layer by logging and returning to client

### Testing
- Mock external dependencies using mockups
- Use Jest as the testing framework
- Follow AAA (Arrange, Act, Assert) pattern in tests
- Test both happy paths and edge cases/error conditions
- Use dependency injection to facilitate testing
- Use mock datasources for database interactions
- NEVER change the original code to make it easier to test, instead, write tests that cover the original code as it is


### Logging
- Use the logger from @user-office-software/duo-logger
- Do not use variables in log message strings, put variables in context
- Include relevant context in log messages
- Log different levels appropriately (info, warning, error)
- Avoid logging sensitive information
- Structure log messages for easy parsing

### Data Validation
- Use Yup schemas for input validation
- Validate inputs early in the request lifecycle
- Return clear validation error messages
- Use TypeScript to enforce types at compile time

### Security
- Sanitize all user inputs to prevent injection attacks
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization
- Follow the principle of least privilege

## Implementation Process
1. Define the domain model and interfaces
2. Create database migrations for schema changes
3. Implement data sources for database access
4. Define GraphQL types and resolvers
5. Implement business logic in resolvers or services
6. Add validation and error handling
7. Write unit tests
8. Register in the dependency injection container

## Additional Guidelines
- Document complex functions and methods with JSDoc
- Use ESLint and Prettier for consistent code formatting
- Register new dependencies in the Tokens file and container

## Common Patterns
- Repository Pattern for data access
- Dependency Injection for service resolution
- Factory Pattern for creating objects
- Adapter Pattern for external integrations
- Observer Pattern for event handling
