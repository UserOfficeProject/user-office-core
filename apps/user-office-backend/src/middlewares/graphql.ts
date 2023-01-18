import {
  ApolloServerPlugin,
  BaseContext,
  ApolloServer,
  ContextFunction,
} from '@apollo/server';
import { ApolloServerPluginLandingPageGraphQLPlayground } from '@apollo/server-plugin-landing-page-graphql-playground';
import {
  ExpressContextFunctionArgument,
  expressMiddleware,
} from '@apollo/server/express4';
import {
  ApolloServerPluginInlineTraceDisabled,
  ApolloServerPluginLandingPageDisabled,
} from '@apollo/server/plugin/disabled';
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
import initGraphQLClient from './graphqlClient';

export const context: ContextFunction<
  [ExpressContextFunctionArgument],
  BaseContext
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

  const errorLoggingPlugin: ApolloServerPlugin<BaseContext> = {
    async requestDidStart() {
      return {
        async didEncounterErrors({ errors }) {
          logger.logInfo('GraphQL response contained error(s)', {
            errors,
          });
        },
      };
    },
  };

  const plugins = [
    ApolloServerPluginInlineTraceDisabled(),
    // Explicitly disable playground in prod
    process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageGraphQLPlayground({
          settings: { 'schema.polling.enable': false },
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
  }

  const server = new ApolloServer({
    schema: schema,
    plugins: plugins,
    formatError: (formattedError, error) => {
      const env = process.env.NODE_ENV;

      // NOTE: This is fixed in the next PR for improving the logging and error handling (https://github.com/UserOfficeProject/user-office-core/pull/133)
      // if (env === 'production') {
      //   // prevent exposing too much information when running in production
      //   federatedSchema = applyMiddleware(federatedSchema, rejectionSanitizer);
      // } else {
      //   federatedSchema = applyMiddleware(federatedSchema, rejectionLogger);
      // }

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
