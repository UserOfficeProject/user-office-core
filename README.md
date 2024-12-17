d
# User Office Core

[![Build Status](https://github.com/UserOfficeProject/user-office-core/actions/workflows/test-build.yml/badge.svg?branch=master)](https://github.com/UserOfficeProject/user-office-core/actions)
[![DeepScan grade](https://deepscan.io/api/teams/19157/projects/22488/branches/665548/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=19157&pid=22488&bid=665548)
[![Known Vulnerabilities](https://snyk.io/test/github/UserOfficeProject/user-office-core/master/badge.svg?targetFile=package.json)](https://snyk.io/test/github/UserOfficeProject/user-office-core/master?targetFile=package.json)

---
## Documentation

You can find the full documentation for the User Office project [here](https://userofficeproject.github.io/user-office-core/develop/).

## Contributing

If you're planning to contribute to this project by adding new functionality, we encourage you to discuss it first in the Discussions tab. This helps ensure that your proposed changes align with the project's goals and prevents duplicate efforts. Here's how you can initiate a discussion:

1. Go to the [Discussions](https://github.com/UserOfficeProject/user-office-core/discussions) tab.
2. Start a new discussion thread outlining your proposed changes.
3. Wait for feedback and consensus before proceeding with creating a pull request.

Thank you for your interest in contributing to our project!

## Getting started

To be able to start both backend and frontend locally you will need to:

1. Install all needed dependencies with `npm install`
2. Start the application using `npm run dev` or `npm run start`

## Check the .env file
If .env file is not preset during startup of the project, it will be created using `example.development.env` file template. The `example.development.env` and `.env` files are located in `apps/backend` and `apps/frontend` accordingly.

## Running with docker-compose

If you want to get something running for testing purposes only, you can run the docker-compose file located at the root of the repository. Use the following steps:

1. docker compose up
2. Visit localhost:33000
3. Use the default users for login, Aaron_Harris49@gmail.com (User Officer) or Javon4@hotmail.com (User) with password "Test1234!"

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.<br>

- Open [http://localhost:4000](http://localhost:4000) to view the GraphQL playground and schema in the browser.
- Open [http://localhost:3000](http://localhost:3000) to view the app in the browser.

### `npm run lint`

Lints typescript code and log if there are any errors.<br>
`npm run lint:fix` should be used if you want to fix all auto-fixable errors and warnings.

## Contribution and release versioning

Please refer to the [Contribution guide](CONTRIBUTING.md) to get information about contributing and versioning.

Happy coding! 👨‍💻
