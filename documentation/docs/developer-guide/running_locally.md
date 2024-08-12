To successfully run both the backend and frontend of the project locally, follow these steps:

## Prerequisites

Ensure you have the following installed on your machine:

- Node.js
- npm
- Docker (if using Docker Compose)

## Installation

**1. Install Dependencies**

   Navigate to the root directory of your project and install all necessary dependencies:

      npm install

**2. Start the Application**

   Start the application in development mode:

      npm run dev

   Alternatively, you can use:

      npm run start

## Configuration

**Check the `.env` File**

The application requires environment variables to be set. If a .env file is not present at startup, it will be generated using the example.development.env template.

- Backend: `apps/backend/.env`
- Frontend: `apps/frontend/.env`

Ensure these files are correctly configured before starting the application. For more information about configuration, visit the [Configuration page](./configuration.md)

## Running with Docker Compose

For testing purposes, you can use Docker Compose to quickly set up the project. Follow these steps:

**1. Start Docker Compose**

   Navigate to the root directory of your project and run:

      docker compose up

**2. Access the Application**

- Open your browser and visit [http://localhost:33000](http://localhost:33000).
- Use the following default credentials to log in:
    - User Officer: `Aaron_Harris49@gmail.com` with password `Test1234!`
    - User: `Javon4@hotmail.com` with password `Test1234!`

## GraphQL Playground and Schema

The GraphQL Playground is an interactive, in-browser tool for writing, validating, and testing GraphQL queries. It provides a user-friendly interface to explore the GraphQL API.

- Open your browser and navigate to [http://localhost:4000](http://localhost:4000). This URL will direct you to the GraphQL Playground interface.

## Available Scripts

      npm run lint

Lints typescript code and log if there are any errors.

If you want to fix all auto-fixable errors and warnings use:

      npm run lint:fix