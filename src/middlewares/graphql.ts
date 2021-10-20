import {
  ApolloServerPluginInlineTraceDisabled,
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';
import { applyMiddleware } from 'graphql-middleware';

import 'reflect-metadata';
import baseContext from '../buildContext';
import { ResolverContext } from '../context';
import { UserWithRole } from '../models/User';
import federationSources from '../resolvers/federationSources';
import { registerEnums } from '../resolvers/registerEnums';
import { buildFederatedSchema } from '../utils/buildFederatedSchema';
import rejectionLogger from './rejectionLogger';
import rejectionSanitizer from './rejectionSanitizer';

const apolloServer = async (app: Express) => {
  const PATH = '/graphql';

  registerEnums();

  const { orphanedTypes, referenceResolvers } = federationSources();

  let schema = await buildFederatedSchema(
    {
      resolvers: [
        __dirname + '/../resolvers/**/*Query.{ts,js}',
        __dirname + '/../resolvers/**/*Mutation.{ts,js}',
        __dirname + '/../resolvers/**/*Resolver.{ts,js}',
      ],
      orphanedTypes: [...orphanedTypes],
      validate: false,
    },
    {
      ...referenceResolvers,
    }
  );

  schema = applyMiddleware(schema, rejectionLogger);

  const env = process.env.NODE_ENV;

  if (env === 'production') {
    // prevent exposing too much information when running in production
    schema = applyMiddleware(schema, rejectionSanitizer);
  }

  const server = new ApolloServer({
    schema: schema,
    plugins: [
      ApolloServerPluginInlineTraceDisabled(),
      // Explicitly disable playground in prod
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground({
            settings: { 'schema.polling.enable': false },
          }),
    ],
    context: async ({ req }) => {
      let user = null;
      const userId = req.user?.user?.id as number;
      const accessTokenId = req.user?.accessTokenId;

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
