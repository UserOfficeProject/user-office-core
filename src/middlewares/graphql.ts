import {
  ApolloServerPluginInlineTraceDisabled,
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginUsageReporting,
} from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
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

const apolloServer = async (app: Express) => {
  const PATH = '/graphql';

  registerEnums();

  const { orphanedTypes, referenceResolvers } = federationSources();

  const schema = await buildFederatedSchema(
    {
      resolvers: [
        __dirname + '/../resolvers/**/*Query.{ts,js}',
        __dirname + '/../resolvers/**/*Mutation.{ts,js}',
        __dirname + '/../resolvers/**/*Resolver.{ts,js}',
      ],
      dateScalarMode: 'isoDate',
      orphanedTypes: [...orphanedTypes],
      validate: false,
    },
    {
      ...referenceResolvers,
    }
  );

  const plugins = [
    ApolloServerPluginInlineTraceDisabled(),
    // Explicitly disable playground in prod
    process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageGraphQLPlayground({
          settings: { 'schema.polling.enable': false },
        }),
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
        rewriteError: (err: GraphQLError) => {
          err.message = 'Error Redacted';

          return err;
        },
      })
    );
  }

  const server = new ApolloServer({
    schema: schema,
    plugins: plugins,
    context: async ({ req }) => {
      let user = null;
      const userId = req.user?.user?.id as number;
      const accessTokenId = req.user?.accessTokenId;
      const userAuthorization = container.resolve<UserAuthorization>(
        Tokens.UserAuthorization
      );

      if (req.user) {
        if (accessTokenId) {
          const { accessPermissions } =
            await baseContext.queries.admin.getPermissionsByToken(
              accessTokenId
            );

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
              req.user.currentRole ||
              (req.user.roles ? req.user.roles[0] : null),
            externalToken: req.user.externalToken,
            externalTokenValid:
              req.user.externalToken !== undefined
                ? await userAuthorization.isExternalTokenValid(
                    req.user.externalToken
                  )
                : false,
            impersonatingUserId: req.user.impersonatingUserId,
          } as UserWithRole;
        }
      }

      const context: ResolverContext = { ...baseContext, user };

      return context;
    },
  });

  await server.start();

  server.applyMiddleware({ app: app, path: PATH });
};

export default apolloServer;
