# AGENTS.md

Instructions for AI coding assistants and agents (GitHub Copilot, Claude Code, Cursor, Codex, Gemini and others) working in this repository. The file follows the [agents.md](https://agents.md) format.
- This file is the **single source of truth**. `CLAUDE.md` and `.github/copilot-instructions.md` only point here.
- **Backend and frontend coding conventions** live only in [`.github/instructions/`](.github/instructions/) (`backend.instructions.md`, `frontend.instructions.md`). This file points to them and does not repeat them, so keep each rule in one place. If they conflict with this file, this file wins.
---

## Project overview

This file does not repeat the project documentation. For background, read the existing docs. They are in [`documentation/docs/`](documentation/docs/) and published at <https://userofficeproject.github.io/user-office-core/develop/>.

| Topic | Read |
| --- | --- |
| Repo information | [README.md](README.md)
| Running locally, `.env` files, Docker Compose demo and default logins | [README.md](README.md), [`running_locally.md`](documentation/docs/developer-guide/running_locally.md) |
| Environment variables and configuration | [`configuration.md`](documentation/docs/developer-guide/configuration.md) |
| Tech stack | [`tech_stack.md`](documentation/docs/developer-guide/tech_stack.md). Exact libraries and versions are in [Package information](#package-information) |
| System components (factory, scheduler, gateway, cron, external systems) | [`architecture.md`](documentation/docs/developer-guide/architecture.md) |
| End-to-end example of adding a feature | [`step-by-step.md`](documentation/docs/developer-guide/step-by-step.md) |
| Dependency injection, error handling, RabbitMQ, email | [`dependency_injection.md`](documentation/docs/developer-guide/dependency_injection.md), [`error_handling.md`](documentation/docs/developer-guide/error_handling.md), [`rabbitmq.md`](documentation/docs/developer-guide/rabbitmq.md), [`email.md`](documentation/docs/developer-guide/email.md) |
| Roles, root vs derived roles, tags | [`roles.md`](documentation/docs/developer-guide/roles.md) |
| Domain terms | [`glossary.md`](documentation/docs/glossary.md) |
| Technique proposals | [`technique_proposals.md`](documentation/docs/developer-guide/technique_proposals.md) |
| Kubernetes / Helm deployment | [`kubernetes.md`](documentation/docs/developer-guide/kubernetes.md) |
| Contributing, commit convention, releases | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Editing the docs themselves | [`documentation_changes.md`](documentation/docs/developer-guide/documentation_changes.md) |

If you change behaviour that one of these pages describes, update the page in the same PR.

---

## Repository structure

### Top level

```text
user-office-core/
├── apps/
│   ├── backend/          # GraphQL API server (Node/Express/Apollo/TypeGraphQL)
│   ├── frontend/         # React single-page app (Vite + MUI)
│   └── e2e/              # Cypress end-to-end tests that drive the frontend against a real backend
├── validation/           # Shared Yup validation schemas, published as @user-office-software/duo-validation
├── documentation/        # MkDocs user and developer documentation
├── metrics/              # Optional Prometheus + Grafana stack (docker-compose.metrics.yml)
├── .github/
│   ├── workflows/        # CI: lint, test-build (unit + e2e), Docker build/push, release, docs, CodeQL
│   ├── instructions/     # Path-scoped AI rules (backend.instructions.md, frontend.instructions.md)
│   └── copilot-instructions.md
├── .husky/pre-commit     # Runs lint-staged (lints the app whose files you changed)
├── docker-compose.yml    # "Try it out" stack: proxy, db, backend, frontend, factory, auth server
├── package.json          # Root orchestration scripts (they cd into each app)
├── AGENTS.md             # This file
└── CONTRIBUTING.md       # Commit conventions and release process
```

Each app has its **own `package.json`, `node_modules`, `tsconfig.json` and ESLint config**. The root `package.json` mostly delegates. For example, `npm run lint:backend` is `cd apps/backend && npm run lint`. Running `npm install` at the root also installs the backend, frontend and e2e dependencies through `postinstall`.

### `apps/backend`

```text
apps/backend/
├── index.ts                  # Entry point: Express app, middleware chain, Apollo server, async jobs
├── src/
│   ├── resolvers/            # GraphQL schema layer (TypeGraphQL decorators). Thin: no business logic
│   │   ├── queries/          #   one file per query resolver, e.g. CallsQuery.ts
│   │   ├── mutations/        #   one file per mutation resolver, e.g. CreateCallMutation.ts
│   │   └── types/            #   GraphQL object types and field resolvers, e.g. types/Call.ts
│   ├── queries/              # Read business logic + authorization, e.g. CallQueries.ts (+ .spec.ts)
│   ├── mutations/            # Write business logic, validation, events, e.g. CallMutations.ts (+ .spec.ts)
│   ├── datasources/          # Data-access interfaces, e.g. CallDataSource.ts
│   │   ├── postgres/         #   real Knex/PostgreSQL implementations
│   │   ├── mockups/          #   in-memory mocks used by unit tests
│   │   └── stfc/             #   STFC-specific overrides
│   ├── models/               # Domain models and enums (plain TS classes, not GraphQL types)
│   ├── auth/                 # Authorization classes per entity (ProposalAuthorization.ts...) + facility user auth
│   ├── decorators/           # @Authorized, @ValidateArgs, @EventBus, ... used on query/mutation methods
│   ├── config/               # Dependency injection wiring
│   │   ├── Tokens.ts         #   DI token for every injectable service/data source
│   │   ├── index.ts          #   picks dependencyConfig*.ts from the DEPENDENCY_CONFIG env var
│   │   └── dependencyConfig{Default,ESS,STFC,ELI,DLS,E2E,Test}.ts
│   ├── context/              # ResolverContext type (user, queries, mutations, loaders) passed to resolvers
│   ├── events/               # Application event definitions and the event bus
│   ├── eventHandlers/        # Reactions to events: email, logging, message broker, workflow
│   ├── workflowEngine/       # Proposal/experiment workflow state machine and guards
│   ├── asyncJobs/            # Scheduled background jobs
│   ├── factory/              # PDF/XLSX/ZIP generation via the external "factory" service
│   ├── middlewares/          # Express middleware: auth, files, health/readiness, metrics, tracing, Apollo setup
│   ├── loaders/              # DataLoader batching (users)
│   ├── services/             # Integrations with external systems (ROR API, asset registrar...)
│   └── utils/                # Helpers (cache, email template rendering, ...)
├── db_patches/               # Ordered SQL migrations, applied automatically on startup
│   ├── NNNN_Description.sql
│   └── db_seeds/             # Seed data used by e2e tests (prepareDB with includeSeeds)
├── generated/                # UOWS client generated from openapi.yaml. Do not edit (git-ignored)
├── docker-compose.yml        # Dev dependencies: postgres, rabbitmq, factory, auth server
├── docker-compose.e2e.yml    # Dependencies for e2e runs (STFC variant: docker-compose-stfc.e2e.yml)
├── jest.unit.config.js       # Runs *.spec.ts using dependencyConfigTest (mock data sources)
└── jest.integration.config.js# Runs *.test.ts against a real database
```

See [Backend architecture](#backend-architecture) for how these layers fit together.

### `apps/frontend`

```text
apps/frontend/
├── index.html, vite.config.mts
├── src/
│   ├── index.tsx             # Bootstraps React, theme and providers
│   ├── components/           # UI, grouped by domain (call/, proposal/, fap/, review/, questionary/, ...)
│   │   ├── App.tsx, AppRoutes.tsx   # Top-level app and route table
│   │   └── common/           # Reusable building blocks (tables, dialogs, form inputs, ...)
│   ├── graphql/              # *.graphql operation documents grouped by domain (input to codegen)
│   ├── generated/sdk.ts      # Typed GraphQL SDK generated from graphql/ + backend schema. Do not edit (git-ignored)
│   ├── hooks/                # Data hooks by domain; hooks/common/useDataApi.ts wraps the SDK
│   ├── context/              # React context providers: user, settings, feature flags, downloads, idle
│   ├── models/               # Frontend-side models and questionary helpers
│   ├── utils/                # Helpers (time, math, error handling, downloads, ...)
│   └── styles/               # Shared styled components
├── public/locales/           # i18next translation files
├── scripts/generate-graphql-sdk.js
└── codegen_template.yml      # Codegen config: schema from SCHEMA_URL, documents src/graphql/**/*.graphql
```

**How the frontend talks to the backend.** You write an operation in `src/graphql/<domain>/<name>.graphql`, then regenerate the SDK. The SDK gains a typed method, which components call through `const { api } = useDataApiWithFeedback()` (or `useDataApi()`). See `components/call/CreateUpdateCall.tsx` for `api({ toastSuccessMessage }).createCall(...)`. The e2e app imports the same `sdk.ts` through a path alias.

### `apps/e2e`

```text
apps/e2e/
├── cypress.config.ts
└── cypress/
    ├── e2e/                  # One spec per feature area, e.g. calls.cy.ts, proposals.cy.ts, FAPs.cy.ts
    ├── support/              # Custom cy.* commands per domain (cy.resetDB, cy.createCall, cy.login, ...)
    └── fixtures/             # Files used by tests (uploads, import/export JSON)
```

Tests call the backend directly through the generated SDK to set up data, then drive the UI. `cy.resetDB()` calls the `prepareDB` mutation, which **wipes and re-seeds the database**. It is refused when the backend runs in production mode.

### `validation`

This folder holds the Yup schemas, organised by domain (`src/Call`, `src/Proposal`, ...). It builds to `validation/lib` (git-ignored) and is used by **both** the backend (`@ValidateArgs`) and the frontend (Formik), so the two always validate the same way. Each app's `postinstall` and `build` rebuilds it. See [Validation rules](#validation-rules).

### `documentation`

MkDocs sources live in `documentation/docs/` (`user-guide/`, `developer-guide/`, `faq.md`, ...). Changes are deployed automatically from `develop` and on release. See [`documentation_changes.md`](documentation/docs/developer-guide/documentation_changes.md) for writing guidelines, adding pages and previewing locally.

---

## Backend architecture

### Startup and middleware

`apps/backend/index.ts` starts tracing, then builds the Express app in this order:

`express.json` (5 MB limit) → `metrics` → `authorization` (JWT) → `jwtErrorHandler` → `files` → `factory` → `healthCheck` (`/health`) → `readinessCheck` (`/readiness`) → `exceptionHandler`, then Apollo Server (`src/middlewares/graphql.ts`) and `startAsyncJobs()`.

On startup the backend also applies pending DB patches and runs the facility's `Tokens.ConfigureEnvironment` function (for example `config/stfc/configureSTFCEnvironment.ts`), which sets that facility's feature flags and settings.

### How a GraphQL request flows through the layers

Tracing `createCall` shows every layer:

1. **Resolver** (`src/resolvers/mutations/CreateCallMutation.ts`) declares the GraphQL input and mutation with TypeGraphQL decorators, then delegates straight away:
   `return context.mutations.call.create(context.user, createCallInput);`
   `context` is the `ResolverContext` (`src/context/`). It carries the logged-in `user`, every `queries.*` and `mutations.*` class, and DataLoaders.
2. **Business logic** (`src/mutations/CallMutations.ts`) is a tsyringe `@injectable()` class whose methods all take `(agent: UserWithRole | null, args)` as their first two parameters. The method is wrapped in decorators, then calls the data source and returns either the entity or a `rejection(...)`.
3. **Data source interface** (`src/datasources/CallDataSource.ts`). tsyringe injects the implementation registered under `Tokens.CallDataSource`: `postgres/CallDataSource.ts` at runtime, or `mockups/CallDataSource.ts` in unit tests.
4. **GraphQL type** (`src/resolvers/types/Call.ts`) maps the returned model to the schema, including nested field resolvers.

### Method decorators (`src/decorators/`)

Existing code stacks them in this order. Keep it:

```ts
@ValidateArgs(createCallValidationSchema)   // 1. validate input (runs first)
@Authorized([Roles.USER_OFFICER])           // 2. check login, token and role
@EventBus(Event.CALL_CREATED)               // 3. publish an event after the method returns
async create(agent: UserWithRole | null, args: CreateCallInput): Promise<Call | Rejection> { ... }
```

- `@Authorized(roles)`:
  - With no agent, mutations return `rejection('NOT_LOGGED_IN')` and queries return `null`.
  - If the user's current role is not in `roles`, mutations return `rejection('INSUFFICIENT_PERMISSIONS')` and queries return `null`. An empty list means any logged-in user.
  - API access tokens are checked against their `accessPermissions` keyed as `ClassName.methodName`.
  - Entity-level rules (for example "is this user a member of the proposal?") live in `src/auth/*Authorization.ts`. Call them inside the method.
- `@ValidateArgs(schema, sanitizeFields?)`: see [Validation rules](#validation-rules).
- `@EventBus(Event.X)`: publishes an `ApplicationEvent` (the result, the user id, the input args and whether the result was a rejection) to the event bus. The values are defined in `src/events/event.enum.ts`.

### Errors

The policy is in [`error_handling.md`](documentation/docs/developer-guide/error_handling.md). Read it before you add error handling. In short:

- **Return** `rejection(reason, context)` (from `src/models/Rejection.ts`) for expected failures such as not found, not allowed or invalid input. Put identifiers in `context`, not in `reason`.
- **Let unexpected failures throw.** The Apollo plugin in `src/middlewares/graphql.ts` logs them centrally and strips details in production, so you don't need to log them again.
- Some older code still wraps data-source calls in `try/catch` and returns a rejection (for example `CallMutations.create`). Don't copy that pattern into new code.

### Events, workflow and background work

- **Event handlers** (`src/eventHandlers/`) subscribe to the event bus: email (`email/`, `MailService/`), event logging (`logging.ts`), the RabbitMQ message broker (`messageBroker.ts`, through `duo-message-broker`), `customHandler.ts`, and the workflow handler (`workflowHandler.ts`).
- **Workflow engine** (`src/workflowEngine/`): a state machine (`stateMachine/`) that moves proposals and experiments between statuses. Transitions are triggered by events and gated by guards in `workflowEngine/guards/` (for example `isCallEndedGuard`). Status actions (emails, RabbitMQ messages and so on) that run on a status change are implemented under `eventHandlers/workflowEntities/`.
- **Async jobs** (`src/asyncJobs/`): cron-style jobs started at boot and listed in `allAsyncJobs.ts`.
- **Factory** (`src/factory/`, `src/middlewares/factory/`): PDF, XLSX and ZIP generation is delegated to the external `factory` service over HTTP.

### Dependency injection and facility configuration

For a full walkthrough, including overriding a data source for a facility, see [`dependency_injection.md`](documentation/docs/developer-guide/dependency_injection.md).

- Every injectable has a token in `src/config/Tokens.ts`.
- `src/config/index.ts` loads `dependencyConfig<Facility>.ts` based on `DEPENDENCY_CONFIG`. Each file maps tokens to implementations with `mapClass` / `mapValue`: data sources, the user-authorization class, email service, message broker, environment configurator, logger setup and so on.
- `dependencyConfigTest.ts` maps mock data sources and is used by Jest unit tests. `dependencyConfigE2E.ts` is used by Cypress runs.

---

## Package information

There are no npm workspaces. Each folder below is an independent npm package with its own `package-lock.json`.

| Folder | Package name | Role | Key dependencies (see `package.json` for exact versions) |
| --- | --- | --- | --- |
| `/` | `user-office-core` | Orchestration scripts, husky, lint-staged | `concurrently`, `wait-on` |
| `apps/backend` | `user-office-backend` | GraphQL API | `@apollo/server` 5, `type-graphql` 2.0 beta, `graphql` 16, `express` 4, `knex` 3 + `pg`, `tsyringe` 4, `yup` 1, `luxon`, `pug` / `email-templates`, OpenTelemetry |
| `apps/frontend` | `user-office-frontend` | React SPA | `react` 18, `@mui/material` 5, `react-router-dom` 6, `formik` 2, `yup` 1, `i18next` / `react-i18next`, `@material-table/core`, `tinymce`, `graphql-request`, `@graphql-codegen/*`, `vite` |
| `apps/e2e` | `user-office-core-e2e` | Cypress tests | `cypress` 15, `@faker-js/faker`, TypeScript 5.3 |
| `validation` | `@user-office-software/duo-validation` | Shared Yup schemas, built to `lib/` | `yup` 1, `luxon`, `sanitize-html` |

### Node.js version

The project runs on **Node.js 22 or later**. The `engines` field in each app's `package.json` is the source of truth for the exact minimum Node and npm versions, so check it there rather than relying on a version written in docs:

- [`apps/backend/package.json`](apps/backend/package.json)
- [`apps/frontend/package.json`](apps/frontend/package.json)
- [`apps/e2e/package.json`](apps/e2e/package.json)
- [`validation/package.json`](validation/package.json)

Do not change `engines` or a Dockerfile's base image unless a human has asked you to.

### Internal `@user-office-software/*` packages

These are published from other UserOfficeProject repositories, not this one, except `duo-validation`:

- `duo-logger`: structured logging (`logger.logInfo/logWarn/logError/logException`). Use it instead of `console`.
- `duo-localisation`: shared localisation strings, used by the backend and frontend.
- `duo-message-broker`: RabbitMQ client used by the backend event handlers.
- `duo-validation`: the local `validation/` folder, linked into the backend and frontend as `file:../../validation`.
- `openid`: OpenID Connect helpers for OAuth login.
- `uows_client_generator` (backend dev dependency): generates `apps/backend/generated/` from `openapi.yaml` for the STFC UOWS integration.

### Dependency notes

- Only change `package.json` / `package-lock.json` when a human has explicitly asked you to (see [AI usage policy](#ai-usage-policy)). Ask before adding a library, and prefer what is already installed: `luxon` for dates, `yup` for validation, MUI for UI.
- Each app pins its own copies of shared libraries, and the versions can differ: for example `i18next` is 23 in the frontend and 26 in the backend. Check the specific app's `package.json` before you use an API.
- The root scripts `install:libs:shared-types` and `generate:shared:types` are historical names. `libs/` no longer exists, and `generate:shared:types` actually regenerates the frontend SDK.

---

## Validation rules

All input validation is written once, as Yup schemas in `validation/src/<Domain>/index.ts`, and shared by the backend and frontend.

**Writing schemas**

- Name schemas `<action><Entity>ValidationSchema`, for example `createCallValidationSchema` or `assignInstrumentsToCallValidationSchema`.
  - Multi-step Formik wizards export an array of per-step schemas named `...ValidationSchemas`, for example `createCallValidationSchemas`. The backend merges them with `mergeValidationSchemas` (`apps/backend/src/utils/helperFunctions.ts`).
  - When the backend needs different rules from the form, export a separate `...ValidationBackendSchema`, as `updateCallValidationBackendSchema` does.
- Always give a human-readable message (`.required('Short Code is required')`). These messages are shown to users and returned in API rejections.
- Reuse the helpers in `validation/src/util.ts` rather than redefining them:
  - date helpers: `TYPE_ERR_INVALID_DATE`, `TYPE_ERR_INVALID_DATE_TIME`, `isValidDate`
  - message builders: `minCharactersMsg`, `maxCharactersMsg`, `oneOfMsg`, `atOrLaterThanMsg`
  - ID schemas: `ID`, `NumericalID`
  - HTML helpers: `sanitizeHtmlAndCleanText`, `countWordsInHtml`
  - shared limits such as `FAP_REVIEW_COMMENT_CHAR_LIMIT`
- For cross-field rules, use `.when(...)` and guard against invalid dates, following `validation/src/Call/index.ts`.
- If you add a new domain folder, export it from `validation/src/index.ts`.
- Answers to questionnaire questions are validated per question type in `validation/src/Questionary/` (text input, rich text, number, ...). Keep the backend question-type definitions in `apps/backend/src/models/questionTypes/` consistent with them.

**Using schemas**

- **Backend:** put `@ValidateArgs(schema)` on the business method.
  - It validates the second argument with `abortEarly: false`. On failure it returns `rejection('Input validation errors', { errors, inputArgs })` without calling the method.
  - Pass field names as the second argument (`@ValidateArgs(schema, ['description'])`) to run them through `sanitize-html` with the rich-text sanitizer config before validation. Do this for every field that accepts HTML.
- **Frontend:** pass the same schema to Formik's `validationSchema`. Import it from `@user-office-software/duo-validation`, or from a domain subpath such as `@user-office-software/duo-validation/lib/Call`.
- Never duplicate a rule in only one app. If the frontend and backend must agree, the rule belongs in `validation/`.

**Testing and building**

- Tests are `*.spec.ts` files next to the schema (for example `validation/src/User/index.spec.ts`). Run them with `npm --prefix validation test`.
- After any change, run `npm --prefix validation run build`. The apps consume the compiled `lib/`, so they will not see source changes until it is rebuilt.

---

## Important project context

**Domain glossary.** This is a quick reference to the terms you will meet in code. The full glossary is [`glossary.md`](documentation/docs/glossary.md).

| Term | Meaning |
| --- | --- |
| Call | A time window in which users can submit proposals. It is linked to a template, a workflow, instruments and FAPs |
| Proposal | A user's request for beam time or facility access, owned by a principal investigator (PI) with co-proposers |
| Template / Questionary | A configurable questionnaire (template = definition, questionary = one filled-in instance). Question types are in `models/questionTypes/` |
| FAP | Facility Access Panel, the review panel that scores proposals. It was previously called **SEP**, and you may still see that name in old patches and docs |
| Technical / internal review | Feasibility review by instrument scientists, and optional internal reviews |
| Instrument / Technique | The beamline or instrument requested. Techniques group instruments |
| Workflow / Status | A configurable state machine that each proposal or experiment moves through |
| Experiment, ESF, Visit, Shipment | Post-acceptance stages: scheduled experiments, experiment safety forms, site visits and sample shipments |

**Roles** (`apps/backend/src/models/Role.ts`): `user`, `user_officer`, `fap_chair`, `fap_secretary`, `fap_reviewer`, `instrument_scientist`, `experiment_safety_reviewer`, `internal_reviewer`, `proposal_reader`.

- A user can hold several roles and acts in one `currentRole` at a time.
- Non-root roles can be scoped to tags (`@AgentTags`).
- `user_officer` is the facility administrator.
- Root roles, derived roles, tags and the Proposal Reader flags are explained in [`roles.md`](documentation/docs/developer-guide/roles.md).

**Feature flags and settings**

- Feature flags (`FeatureId` in `models/Feature.ts`, for example `SCHEDULER`, `SHIPPING`, `FAP_REVIEW`, `TECHNICAL_REVIEW`) and settings (`SettingsId` in `models/Settings.ts`, for example palette colours and external auth URLs) are stored in the database.
- Each facility's `configure<Facility>Environment.ts` sets them on startup. They can also be changed at runtime through admin mutations.
- The frontend reads feature flags through `FeatureContext` (`featuresMap.get(FeatureId.X)?.isEnabled`) and settings through `SettingsContext`.
- New optional functionality should sit behind a feature flag. Do not branch on facility names.

**Things that commonly trip agents up**

- Several facilities share one codebase. A change that is correct for one facility's config can break another, so check every `dependencyConfig*.ts` and `datasources/stfc/` override that is affected.
- The GraphQL schema is code-first (TypeGraphQL). There is no `.graphql` schema file in the backend, so the frontend SDK must be regenerated (`npm run generate:sdk`) after backend schema changes.
- `generated/` folders and `validation/lib` are build outputs. Do not edit them or commit them.
- DB patches run automatically and only once. A merged patch can never be fixed in place.
- STFC has its own user/authorization stack (`StfcUserAuthorization`, UOWS client) and a separate e2e config (`start:e2e:stfc`, `apps/backend/docker-compose-stfc.e2e.yml`).

---

## Dev environment tips

- **Prerequisites:** Node.js 22 or later and npm 10.9 or later (see [Node.js version](#nodejs-version)), and Docker with Compose, which the backend uses for Postgres, RabbitMQ, the factory and the auth server.
- **First-time setup:** run `npm install` at the repo root. It installs every app and builds `validation/`.
- **Run everything:** `npm run dev`.
  - Starts the backend Docker dependencies (`apps/backend/docker-compose.yml`) and the backend with hot reload on **http://localhost:4000**. That URL also serves the GraphQL playground and schema.
  - When the backend's `/readiness` responds, starts the Vite frontend on **http://localhost:3000**.
- **Environment files:** on first run, `apps/backend/.env` and `apps/frontend/.env` are created from each app's `example.development.env`. Edit the `.env` copies, never the examples (unless you are adding a new variable), and never commit `.env`.
- **Facility behaviour:** set `DEPENDENCY_CONFIG` in `apps/backend/.env` to `ess`, `stfc`, `eli`, `dls`, `e2e` or `test`. If it is missing, the backend uses `dependencyConfigDefault.ts`.
- **Run one app only:** `npm run dev:backend` or `npm run dev:frontend` (the frontend needs a running backend).
- **Try the app without a dev setup:** `docker compose up` at the root, then open http://localhost:33000. Default login users are listed in the [README](README.md).
- **Work inside one app:** `cd apps/<app>` and use that app's own scripts. Check its `package.json` rather than assuming a root script exists.
- **Generated code is git-ignored and rebuilt by scripts.** If imports from `generated/` fail, regenerate it (see the next section) rather than creating the files by hand.

---

## Build and test commands

Run these from the **repository root** unless the command starts with `cd`.

| Command | What it does | When to use it |
| --- | --- | --- |
| `npm install` | Installs root + backend + frontend + e2e deps; builds `validation/` | After cloning or pulling dependency changes |
| `npm run dev` | Backend (Docker deps + ts-node-dev) on :4000, then frontend (Vite) on :3000 | Day-to-day development |
| `npm run lint` | `tsc --noEmit` + ESLint for backend, frontend and e2e | Before every commit |
| `npm run lint:fix` | Same, applying auto-fixes | To fix formatting/import-order issues |
| `npm run lint:backend` / `lint:frontend` / `lint:e2e` | Lint a single app | After changing one app |
| `npm run build` | Production build of backend (`build/`) and frontend (`build/`) | To check that the project compiles end to end |
| `npm run generate:sdk` | Starts the backend, waits for `/health`, regenerates `apps/frontend/src/generated/sdk.ts` | After **any** GraphQL schema change or `.graphql` file change |
| `npm run generate:uows` | Regenerates the backend UOWS client from `openapi.yaml` | After changing `openapi.yaml` (lint/build run it too) |
| `cd apps/backend && npm test` | Jest unit tests (`*.spec.ts`) with mock data sources. No DB needed | After any backend change |
| `cd apps/backend && npm test -- src/mutations/CallMutations` | Runs only the test files matching the path | Fast feedback on one area |
| `cd apps/backend && npm test -- -t "should create call"` | Runs only tests whose name matches | Debugging one test |
| `cd apps/backend && npm run test:integration` | Jest integration tests (`*.test.ts`) against Postgres on :5432 | When changing Postgres data sources or SQL |
| `npm --prefix validation test` | Jest tests for the shared validation schemas | After changing `validation/` |
| `npm --prefix validation run build` | Rebuilds `validation/lib` | After changing `validation/`, so the backend and frontend see the change |
| `cd apps/e2e && npm run cy:open` | Interactive Cypress runner (app must be running via `npm run dev`) | Writing or debugging e2e tests |
| `cd apps/e2e && npm run cy:run` | Headless run of all e2e specs | Full local regression (slow) |

**Notes**

- The pre-commit hook runs `lint-staged`, which runs the full lint of each app you touched. Fix the errors it reports; do not bypass it.
- Backend `npm run lint` also runs `tsc --noEmit`, so type errors show up as lint failures.
- E2E tests call `cy.resetDB()`, which **wipes your local database**. Do not run them against a database whose data you want to keep.
- CI (`.github/workflows/test-build.yml`) runs build, backend unit tests and the Cypress suite (default and STFC configs) in parallel shards. `lint.yml` runs lint, and the PR title check enforces the commit convention.

---

## Common tasks

### Add or change a GraphQL query or mutation

[`step-by-step.md`](documentation/docs/developer-guide/step-by-step.md) walks through a complete example (locking out a user) across the DB, backend and frontend. The checklist:

1. **Model:** add or extend the domain model in `apps/backend/src/models/`.
2. **Data access:** add the method to the interface in `src/datasources/XDataSource.ts`, then implement it in **both** `datasources/postgres/XDataSource.ts` and `datasources/mockups/XDataSource.ts`. Also update `datasources/stfc/` if STFC overrides that data source.
3. **Business logic:** add the method to `src/mutations/XMutations.ts` or `src/queries/XQueries.ts` with the right `@Authorized([...])` roles and, for mutations, `@ValidateArgs(schema)`. Put new input schemas in `validation/`.
4. **Resolver:** add a thin resolver in `src/resolvers/mutations/` or `src/resolvers/queries/` that calls `context.mutations.x.method(...)` or `context.queries.x.method(...)`. Add or extend GraphQL types in `src/resolvers/types/`.
5. **Unit test:** add cases to `src/mutations/XMutations.spec.ts` or `src/queries/XQueries.spec.ts` for the happy path, unauthorized users and invalid input.
6. **Frontend:** add a `.graphql` document in `apps/frontend/src/graphql/<domain>/`, run `npm run generate:sdk`, then use the new SDK method through `useDataApi()`.
7. **E2E:** cover user-visible behaviour in `apps/e2e/cypress/e2e/`, adding a support command if setup is reusable.

### Add a new service or data source

Add a token in `src/config/Tokens.ts`. Register the implementation in `dependencyConfigDefault.ts`, every facility config that needs it, `dependencyConfigE2E.ts`, and `dependencyConfigTest.ts` (with the mock). Inject it with `@inject(Tokens.X)`.

### Change the database schema or data

1. Find the highest patch number: `ls apps/backend/db_patches | sort | tail -3`.
2. Create `apps/backend/db_patches/NNNN_PascalCaseDescription.sql` with the next number, following this template:

   ```sql
   DO
   $$
   BEGIN
       IF register_patch(
           'NNNN_PascalCaseDescription.sql',
           '<Author Name>',
           '<What this patch does>',
           '<YYYY-MM-DD>'
       ) THEN
           -- your DDL / DML here
       END IF;
   END;
   $$
   LANGUAGE plpgsql;
   ```

3. Restart the backend. Patches are applied on startup, and `register_patch` makes sure each one runs only once.
4. **Never edit, rename or renumber a patch that is already on `develop`.** Write a new patch instead.
5. If e2e tests need the data, update `db_patches/db_seeds/`.

### Change shared validation

Edit `validation/src/<Domain>/` following [Validation rules](#validation-rules), run `npm --prefix validation test` and `npm --prefix validation run build`, then restart the backend and frontend.

---

## Coding conventions

### Backend and frontend code

The conventions for each app are kept in **one place only**: the path-scoped instruction files. Read the relevant file before you write or review code in that app.

| Code | Conventions file |
| --- | --- |
| `apps/backend/**` | [`.github/instructions/backend.instructions.md`](.github/instructions/backend.instructions.md) |
| `apps/frontend/**` | [`.github/instructions/frontend.instructions.md`](.github/instructions/frontend.instructions.md) |

GitHub Copilot loads these files automatically, based on their `applyTo` paths. Other tools (Claude Code, Cursor, Codex, Gemini, ...) do not, so open the file yourself. Do not copy their rules into this file. Edit the instruction file instead.

### Repository-wide conventions

These apply to every app, including `apps/e2e` and `validation`.

- **Formatting and linting** (from each app's `eslint.config.js` and `.prettierrc`):
  - TypeScript `strict` mode. Avoid `any`, and use the existing types from `models/` or the generated SDK.
  - Indent with 2 spaces, use single quotes and add ES5 trailing commas.
  - ESLint and Prettier are the authority. Run `npm run lint:fix` rather than formatting by hand.
  - `import/order` is enforced: groups separated by blank lines, alphabetised (case-insensitive). Unused imports are errors.
  - Do not add `eslint-disable` comments to silence real problems.
- Use `async`/`await` rather than callbacks or raw promise chains.
- Use `luxon` for dates and times.
- Prefer descriptive names over comments. Add comments only where the reason for the code is not obvious.
- **Facility-specific behaviour** goes through DI config, factories or feature flags. Do not write `if (facility === 'X')` in shared code.
- Match the patterns of neighbouring code before you introduce new libraries or abstractions.
- E2E specs are named `apps/e2e/cypress/e2e/<area>.cy.ts`, for example `calls.cy.ts`.

---

## Testing instructions

- Add or update tests for the code you change, even if nobody asked.
  - **Backend logic:** Jest `*.spec.ts` next to the file, using mock data sources.
  - **UI behaviour:** Cypress specs in `apps/e2e/cypress/e2e/`. Reuse the `cypress/support` commands.
- Before you call a task done, run `npm run lint` and the relevant tests (at least `cd apps/backend && npm test` for backend changes). Report exactly what you ran and the result. If you could not run something (for example e2e, which needs Docker), say so.
- After moving files or changing imports, run the affected app's lint so that the type-check catches broken paths.

---

## Security considerations

This system stores **personal data** (users, institutions, proposals, reviews, safety documents).

- Never commit secrets, tokens or `.env` files. Do not print secrets in logs, test output or PR text.
- Never log personal data. Pass identifiers in the logger context instead.
- Every new query or mutation needs an explicit authorization check (`@Authorized` plus entity-level checks from `src/auth/`). Never return fields the caller is not allowed to see.
- Use Knex query builders or parameterized queries. Never build SQL by concatenating strings.
- Validate all input with the shared Yup schemas.
- Frontend: never render unsanitised HTML from user input, and never store tokens or sensitive data outside the existing auth mechanism.
- Destructive helpers such as `prepareDB`/`cy.resetDB()` must stay unusable in production.

---

## PR instructions

- **Branch** from `develop` and target `develop`. Name the branch after the Jira key when there is one (`SWAP-1234-short-description`). The PR description job reads it.
- **PR title and commit messages** follow the [Angular convention](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines), checked in CI:
  `type(optional-scope): lowercase description with no trailing period`
  - Allowed types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`.
  - PRs are squash-merged, so the **PR title becomes the release commit**. `fix` → patch release, `feat` → minor release, `BREAKING CHANGE` → major release.
- Run `npm run lint` and the relevant tests before every commit.
- Keep PRs focused. Discuss large features in [GitHub Discussions](https://github.com/UserOfficeProject/user-office-core/discussions) first.
- Update `documentation/docs/` when user-visible behaviour changes.
- Disclose AI assistance as described in the next section.
- See [CONTRIBUTING.md](CONTRIBUTING.md) for the release process.

---

## AI usage policy

These rules apply to every AI tool, in every mode.

### Humans stay accountable

- The person who opens a PR is its author and is responsible for every line in it, however it was produced. Do not submit code you cannot explain.
- AI may assist with reviews but **never replaces a human approval**. At least one human maintainer must approve every PR before merge.
- Agents must not approve PRs, merge PRs or dismiss reviews.

### Disclose AI assistance

- In the PR description, state which AI tools were used
- Add label to the pr `ai:assisted`.

### Protect data and secrets

- Never personal data, credentials, tokens or `.env` contents.

### Actions agents must not take without explicit human instruction

- Push to `master` or `develop`, or open PRs against `master`. Work on a feature branch.
- Force-push, rewrite published history or delete branches.
- Bypass git hooks (`--no-verify`) or skip, disable or weaken lint rules, type checks or tests.
- Add, remove or upgrade dependencies (`package.json` / `package-lock.json`).
- Modify CI/CD workflows (`.github/workflows/`), release configuration, Dockerfiles, `CODEOWNERS` or repository secrets.
- Edit a DB patch that has already been merged.
- Run destructive commands against databases or Docker volumes (for example `DROP`, `TRUNCATE` or `docker compose down -v`), apart from the standard local `prepareDB` used by e2e tests.

### Scope and quality

- Keep changes focused on the task. Do not reformat, rename or refactor unrelated code.
- Do not invent APIs, config keys, environment variables or GraphQL fields. Check that they exist in the codebase.
- Ask instead of guessing when requirements, design choices or facility-specific behaviour are unclear.
- Do not reproduce code from sources whose licence is incompatible with this project's BSD 3-Clause licence.

### Keeping this file up to date

This file, the instruction files in `.github/instructions/` and the docs they link to can fall out of date. Paths move, scripts are renamed and patterns change.

- If you notice an instruction that no longer matches the code (a missing file, a wrong command or a pattern the codebase has moved away from), **tell the human and propose a correction**. Do not silently follow the outdated instruction, and do not silently work around it.
- Propose the change as a concrete diff, and only apply it once the human agrees. Keep it separate from feature work: a separate commit, or a separate PR titled like `docs: update AGENTS.md ...`.
- Put each rule in the one file that owns it: backend and frontend conventions in `.github/instructions/`, product and developer background in `documentation/docs/`, everything else here. Do not duplicate rules between them.
- Agents may suggest changes to the [AI usage policy](#ai-usage-policy), but only a human maintainer can decide to change or relax it.
