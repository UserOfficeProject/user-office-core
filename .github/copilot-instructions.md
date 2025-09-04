# User Office Core - AI Coding Agent Instructions

## Project Overview

User Office Core is a full-stack application for managing user office workflows for scientific facilities. It consists of:

- **Backend**: Express/Node.js GraphQL API server with PostgreSQL database
- **Frontend**: React-based UI using Material UI
- **E2E**: End-to-end tests using Cypress

The system handles proposal management, user administration, and scientific facility workflows.

## Architecture Map

### Backend Component Structure (`/apps/backend`)
- **models/**: Domain interfaces and types (read these first to understand data structures)
- **resolvers/**: GraphQL resolvers (queries + mutations) grouped by domain
- **datasources/**: Repository interfaces defining data access methods
  - **datasources/postgres/**: PostgreSQL implementations of interfaces
  - **datasources/mockups/**: Mock implementations for testing
- **auth/**: Authentication and authorization logic
- **middlewares/**: Express middleware and GraphQL configuration
- **utils/**: Helper functions and utilities
- **events/**: Event-driven messaging system
- **mutations/**: Business logic for mutating data
- **queries/**: Business logic for querying data
- **config/**: Application configuration including DI setup

### Technology Stack
- **GraphQL API**: Apollo Server with TypeGraphQL decorators
- **Database**: PostgreSQL with Knex.js for queries
- **Dependency Injection**: tsyringe container with Symbol tokens
- **Validation**: Yup schemas via `@user-office-software/duo-validation`
- **Authentication**: JWT tokens with role-based access control
- **Messaging**: RabbitMQ via `@user-office-software/duo-message-broker`

### Frontend Structure (`/apps/frontend`)
- **components/**: Reusable UI components (mostly Material UI)
- **context/**: React context providers for global state
- **generated/**: Generated GraphQL types and API client
- **hooks/**: Custom React hooks, especially `useDataApi` for GraphQL
- **models/**: TypeScript interfaces for frontend data models
- **utils/**: Helper functions and utilities

## Code Patterns To Follow

### Backend Patterns
1. **DataSource Pattern**: Always implement and use these interfaces
   ```typescript
   // 1. Define interface in a file like src/datasources/EntityDataSource.ts
   export interface EntityDataSource {
     getById(id: number): Promise<Entity | null>;
     create(input: CreateEntityInput): Promise<Entity>;
     // etc.
   }
   
   // 2. Implement in src/datasources/postgres/EntityDataSource.ts
   @injectable()
   export default class PostgresEntityDataSource implements EntityDataSource {
     // implementation here
   }
   
   // 3. Register in dependency container in src/config/dependencyConfigDefault.ts
   mapClass(Tokens.EntityDataSource, PostgresEntityDataSource);
   ```

2. **GraphQL Resolvers**: Use TypeGraphQL decorators
   ```typescript
   @Resolver()
   export class EntityQuery {
     @Query(() => Entity, { nullable: true })
     async entity(
       @Ctx() context: ResolverContext,
       @Arg('id', () => Int) id: number
     ) {
       return context.queries.entity.get(context.user, id);
     }
   }
   ```

3. **Mutations**: Use decorators for authorization and validation
   ```typescript
   @EventBus(Event.ENTITY_CREATED)
   @ValidateArgs(createEntityValidationSchema)
   @Authorized([Roles.USER_OFFICER])
   async create(
     agent: UserWithRole | null,
     args: CreateEntityArgs
   ): Promise<Entity | Rejection> {
     // implementation using this.dataSource
   }
   ```

4. **Error Handling**: Use rejection pattern with try/catch and await
   ```typescript
   try {
     const result = await this.dataSource.method();
     return result;
   } catch (error) {
     return rejection(
       'Error message here',
       { agent, args },
       error
     );
   }
   ```

### Frontend Patterns
1. **Data Fetching**: Use `useDataApi` or `useDataApiWithFeedback` hooks
   ```typescript
   const { api } = useDataApi();
   // or with loading/error handling
   const { api, isExecuting, error } = useDataApiWithFeedback();
   
   // Then call the API
   const result = await api.createEntity(variables);
   ```

2. **Form Handling**: Use Formik with Yup validation
   ```typescript
   <Formik
     initialValues={initialValues}
     validationSchema={entityValidationSchema}
     onSubmit={async (values) => {
       await api.createEntity({ ...values });
     }}
   >
     {/* Form fields */}
   </Formik>
   ```

## Database Structure

Key tables and relationships:
- **users**: User accounts with roles (linked via role_user)
- **proposals**: Scientific proposals (linked to users via proposer_id)
- **call**: Proposal submission cycles (linked to proposals)
- **proposal_questions**: Configurable questions (linked to topics)
- **proposal_answers**: User responses (linked to proposals and questions)
- **reviews**: Proposal reviews (linked to proposals and users)

## Critical Workflows

### Creating a New Entity Type (Backend)
1. Define model interface in `src/models/Entity.ts`
2. Create database migration in `db_patches/` using `register_patch`
3. Define DataSource interface in `src/datasources/EntityDataSource.ts`
4. Implement PostgreSQL version in `src/datasources/postgres/EntityDataSource.ts`
5. Add to Tokens in `src/config/Tokens.ts` and register in dependency config
6. Create GraphQL type in `src/resolvers/types/Entity.ts`
7. Implement queries in `src/resolvers/queries/EntityQuery.ts`
8. Implement mutations in `src/resolvers/mutations/EntityMutation.ts`
9. Add business logic in `src/queries/EntityQueries.ts` and `src/mutations/EntityMutations.ts`
10. Add mock implementation in `src/datasources/mockups/EntityDataSource.ts`
11. Write tests for mutations and queries

### Creating a New Frontend Feature
1. Generate GraphQL SDK after backend changes using `npm run generate:shared:types`
2. Create components in `apps/frontend/src/components/`
3. Use `useDataApi` hook to communicate with the backend
4. Add routing in the appropriate router configuration
5. Use Material UI components and follow existing styling patterns

## Authorization Pattern
```typescript
// Mutations and queries always check authorization with decorators
@Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
async methodName(agent: UserWithRole | null, args: Args): Promise<Result> {
  // Implementation
}

// DataSources should NOT contain authorization logic
// Authorization is handled at the mutation/query layer
```

## Testing Pattern
```typescript
// Test file structure
describe('Entity Mutations', () => {
  test('User with proper role can create entity', () => {
    return expect(
      entityMutations.create(userWithRole, validInput)
    ).resolves.toMatchObject(expectedResult);
  });

  test('User without permission cannot create entity', () => {
    return expect(
      entityMutations.create(userWithoutRole, validInput)
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });
});
```
