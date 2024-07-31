# API Documentation

## Introduction

The User Office application API provides endpoints to manage user interactions, proposal submissions, reviews, and scheduling. The API is primarily based on GraphQL, with some REST endpoints for specific functions.

## User Office Core API

### User Office Frontend

#### GraphQL Endpoints

**Base URL**: [https://staging.useroffice.ess.eu/graphql](https://staging.useroffice.ess.eu/graphql)

**Queries**

- `x`
  - **Description**: Fetches details of a user by ID.
  - **Example**:
  - **Description**: Retrieves proposals based on status.
  - **Example**:

**Mutations**

## Data Models

## Error Handling

- **400 Bad Request**: The request could not be understood or was missing required parameters.
- **401 Unauthorized**: Authentication failed or user does not have permissions for the requested operation.
- **404 Not Found**: The requested resource could not be found.
- **500 Internal Server Error**: An error occurred on the server.
