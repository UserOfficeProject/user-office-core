
# User Office Core

[![Build Status](https://github.com/UserOfficeProject/user-office-core/actions/workflows/test-build.yml/badge.svg?branch=master)](https://github.com/UserOfficeProject/user-office-core/actions)
[![DeepScan grade](https://deepscan.io/api/teams/19157/projects/22488/branches/665548/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=19157&pid=22488&bid=665548)
[![Known Vulnerabilities](https://snyk.io/test/github/UserOfficeProject/user-office-core/master/badge.svg?targetFile=package.json)](https://snyk.io/test/github/UserOfficeProject/user-office-core/master?targetFile=package.json)

---
## Getting started

To be able to start both backend and frontend locally you will need to:

1. Install all needed dependencies with `npm install`
2. Make sure that `.env` files exist (if they are not added automatically) inside `apps/user-office-backend` and `apps/user-office-frontend` accordingly. There are example env files that could help.
3. Start the application using `npm run dev` or `npm run start`

## How to pull latest changes from separate the repositories

> **_NOTE:_** This is just temporary part until we fully switch to the monorepo.

All you need to do is run two commands:

1. Pull latest changes from the backend repository: `git pull https://github.com/UserOfficeProject/user-office-backend.git develop`. It uses develop branch to pull from. If you want another branch just change that part.
2. Pull latest changes from the frontend repository: `git pull https://github.com/UserOfficeProject/user-office-frontend.git develop`. It uses develop branch to pull from. If you want another branch just change that part.

## Monorepo future plans

Plan on how to continue with the monorepo in the future:

1.  Start adding the shared libraries like: shared-types, validation and others that need to be shared between different apps (example here: https://github.com/martin-trajanovski/user-office-core-monorepo). It requires [craco](https://github.com/dilanx/craco) tool for building react apps that have sources outside src folder. This will cleanup the frontend app a lot because we can move all graphql files and scripts in the shared-types lib and validation will simplify things a lot if added directly as part of the monorepo libs.

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
