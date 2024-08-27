This page provides an overview of the technical stack used in the development of User Office Core, including both backend and frontend components.

## Backend

The backend is designed to handle business logic, database interactions, authentication, and serve API requests. Below follows a breakdown of the key technologies used:

- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine, used for creating the server-side application.
- **Express.js**: A minimal and flexible Node.js web application framework that provides a robust set of features for web applications.
- **TypeScript**: A superset of JavaScript that adds static types, used for writing robust and maintainable code.
- **PostgreSQL**: An open-source relational database used for storing and managing data.
- **Docker**: A platform for developing, shipping, and running applications inside lightweight containers, ensuring consistency across environments.

## Frontend

The frontend is responsible for presenting data to users and handling user interactions. The main technologies include:

- **React**: A JavaScript library for building user interfaces, allowing for the development of single-page applications with interactive UIs.
- **TypeScript**: Enhances code quality and understandability with static typing.
- **Material-UI**: A popular React UI framework that implements Google's Material Design, used for designing the user interface.

## Documentation

The documentation is managed as follows:

- **MkDocs**: A static site generator that builds the documentation site from Markdown files, making it easy to write and maintain the docs.
- **Material for MkDocs**: A Material Design theme for MkDocs, providing a visually appealing design for the documentation.
- **mike**: A tool used alongside MkDocs to handle versioning of the documentation.

## Continuous Integration and Deployment (CI/CD)

The project uses GitHub Actions for CI/CD, automating testing, building, and deploying both the application and documentation:

- **GitHub Actions**: Used to automate workflows for testing, building, and deploying the application upon code changes or specific triggers.

## Development Tools

Several tools and services are used to maintain code quality and facilitate the development process:

- **Prettier**: An opinionated code formatter that ensures consistent code style.
- **ESLint**: A static code analysis tool for identifying problematic patterns in JavaScript code.
- **Husky**: Used to manage Git hooks, running scripts before commits to ensure code quality and run tests.
