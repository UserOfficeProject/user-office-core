# Error Handling

_________________________________________________________________________________________________________

As a rule of thumb, errors in the backend are not handled where they happen. Datasources and mutations let errors travel up to Apollo Server, which logs them in one central place and strips sensitive details before the response reaches the client.

## Two kinds of errors

**Expected failures** — a missing record, a permission problem, invalid input most often occuring in the Mutation layer. Return a `Rejection` instead of throwing:

    if (!invite) {
      return rejection('Invite code not found', { invite: code });
    }

`Rejection` extends `GraphQLError`, and GraphQL turns any `Error` a resolver returns into an entry in the response's `errors` array. So a returned rejection reaches the client without a `throw`.

**Unexpected failures** — a failing query, a bug. Just let them throw. Datasources can add a bit of context to the message and re-throw if needed:

    .catch((error: Error) => {
      throw new Error(`Could not find invites: ${error.message}`);
    })

Note. A caught error returns a success response, so the client believes the operation worked.

_________________________________________________________________________________________________________

## Central logging with Apollo plugin

An Apollo plugin in `src/middlewares/graphql.ts` hooks `didEncounterErrors` and logs every error in the response, along with the requesting user's id:

    logger.logError('GraphQL response contained error(s)', {
      errors: filteredErrors,
      context,
    });

Expired JWTs and invalid external tokens are filtered out first and logged as a warning and an info respectively, since they are routine and would otherwise drown out real errors.

Because this plugin exists, resolvers, mutations and datasources do not need to log errors themselves.

## Hiding details from the client in production

`formatError`, in the same file, deletes `extensions.context` and `extensions.exception` when running in production. The full detail stays in the server log; the client only sees the message.

_________________________________________________________________________________________________________

## Logging an error yourself

Use `logException` when you have an `Error` object, and `logError` when you do not:

    logger.logException('Could not download file', e, { req });
    logger.logError('Something went wrong', { someId });

Both log at `ERROR` level. The difference is that `logException` takes the error as a separate argument and copies its `name`, `message` and `stack` into the log context. This matters: an `Error` passed into `logError` directly serialises to `{}` and its message and stack trace are lost.

## Outside GraphQL

The file and PDF factory endpoints are plain Express routes and never reach the Apollo plugin. They use their own handlers (`exceptionHandler.ts`, `factory.ts`), which log the exception and return a 500.

_________________________________________________________________________________________________________
