import {
  ApolloServerPlugin,
  ApolloServer,
  ContextFunction,
} from '@apollo/server';
import {
  ExpressContextFunctionArgument,
  expressMiddleware,
} from '@apollo/server/express4';
import {
  ApolloServerPluginInlineTraceDisabled,
  ApolloServerPluginLandingPageDisabled,
} from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginUsageReporting } from '@apollo/server/plugin/usageReporting';
import { logger } from '@user-office-software/duo-logger';
import { json } from 'body-parser';
import cors from 'cors';
import { Express } from 'express';
import { GraphQLError } from 'graphql';
import { container } from 'tsyringe';

import 'reflect-metadata';
import { UserAuthorization } from '../auth/UserAuthorization';
import baseContext from '../buildContext';
import { Tokens } from '../config/Tokens';
import { ResolverContext } from '../context';
import { UserWithRole } from '../models/User';
import federationSources from '../resolvers/federationSources';
import { registerEnums } from '../resolvers/registerEnums';
import { buildFederatedSchema } from '../utils/buildFederatedSchema';
import { isProduction } from '../utils/helperFunctions';
import initGraphQLClient from './graphqlClient';

export const context: ContextFunction<
  [ExpressContextFunctionArgument],
  ResolverContext
> = async ({ req }) => {
  let user = null;
  const userId = req.user?.user?.id as number;
  const accessTokenId = req.user?.accessTokenId;
  const userAuthorization = container.resolve<UserAuthorization>(
    Tokens.UserAuthorization
  );

  if (req.user) {
    if (accessTokenId) {
      const { accessPermissions } =
        await baseContext.queries.admin.getPermissionsByToken(accessTokenId);

      user = {
        accessPermissions: accessPermissions
          ? JSON.parse(accessPermissions)
          : null,
        isApiAccessToken: true,
      } as UserWithRole;
    } else {
      user = {
        ...(await baseContext.queries.user.getAgent(userId)),
        currentRole:
          req.user.currentRole || (req.user.roles ? req.user.roles[0] : null),
        externalToken: req.user.externalToken,
        externalTokenValid:
          req.user.externalToken !== undefined
            ? await userAuthorization.isExternalTokenValid(
                req.user.externalToken
              )
            : false,
        isInternalUser: req.user.isInternalUser,
        impersonatingUserId: req.user.impersonatingUserId,
      } as UserWithRole;
    }
  }

  const context: ResolverContext = {
    ...baseContext,
    user,
    clients: {
      scheduler: initGraphQLClient(req.headers.authorization),
    },
  };

  return context;
};

const apolloServer = async (app: Express) => {
  const PATH = '/graphql';

  registerEnums();

  const { orphanedTypes, referenceResolvers } = federationSources();

  // NOTE: glob package that is used in type-graphql for resolvers pattern is expecting only forward slashes.(https://www.npmjs.com/package/glob#:~:text=Please%20only%20use%20forward%2Dslashes%20in%20glob%20expressions.)
  const fixedPath = __dirname.split('\\').join('/');

  const schema = await buildFederatedSchema(
    {
      resolvers: [
        fixedPath + '/../resolvers/**/*Query.{ts,js}',
        fixedPath + '/../resolvers/**/*Mutation.{ts,js}',
        fixedPath + '/../resolvers/**/*Resolver.{ts,js}',
      ],
      dateScalarMode: 'isoDate',
      orphanedTypes: [...orphanedTypes],
      validate: false,
    },
    {
      ...referenceResolvers,
    }
  );

  const errorLoggingPlugin: ApolloServerPlugin<ResolverContext> = {
    async requestDidStart() {
      return {
        async didEncounterErrors({ errors, contextValue: { user }, request }) {
          const context = {
            requestUserId: user?.id,
            request,
          };

          const filteredErrors = errors.filter((error) => {
            if (error.extensions.code === 'EXTERNAL_TOKEN_INVALID') {
              logger.logInfo(
                'GraphQL response contained error(s) due to expired or invalid external token',
                {
                  errors,
                  context,
                }
              );

              return false;
            }

            return true;
          });

          if (filteredErrors.length > 0) {
            logger.logError('GraphQL response contained error(s)', {
              errors: filteredErrors,
              context,
            });
          }
        },
      };
    },
  };

  const plugins = [
    ApolloServerPluginInlineTraceDisabled(),
    // Explicitly disable playground in prod
    isProduction
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageLocalDefault({
          footer: false,
          embed: { initialState: { pollForSchemaUpdates: false } },
        }),
    errorLoggingPlugin,
  ];
  /*
  Only use the usage reporting plugin if apollo studio connection settings are
  present. If used without them, it will prevent the app starting.
  When used, this will clear error messages being sent to Apollo Studio,
  ensuring any personal data and API keys aren't sent to an external service.
  */
  if (process.env.APOLLO_KEY) {
    plugins.push(
      ApolloServerPluginUsageReporting({
        sendErrors: {
          transform: (err: GraphQLError) => {
            err.message = 'Error Redacted';

            return err;
          },
        },
      })
    );
    app.use((req, res, next) => {
      const clientName = req.headers['apollographql-client-name'];
      if (
        typeof clientName === 'string' &&
        clientName.startsWith('UOP frontend')
      ) {
        const userId = req.user?.user.id;
        req.headers['apollographql-client-name'] = userId
          ? `UOP frontend - user ${userId}`
          : 'UOP frontend - anonymous';
      }
      next();
    });
  }

  const server = new ApolloServer({
    schema: schema,
    plugins: plugins,
    formatError(formattedError) {
      // NOTE: Prevent exposing some sensitive data to the client in production.
      if (isProduction) {
        delete formattedError.extensions?.context;
        delete formattedError.extensions?.exception;
      }

      return formattedError;
    },
  });

  await server.start();

  app.use(
    PATH,
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context,
    })
  );
};

export default apolloServer;
