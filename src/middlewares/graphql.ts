import { ApolloServer } from 'apollo-server-express';
import { Express, Request } from 'express';
import 'reflect-metadata';
import baseContext from '../buildContext';
import { ResolverContext } from '../context';
import { Role } from '../models/Role';
import { User, UserWithRole } from '../models/User';
import { registerEnums } from '../resolvers/registerEnums';
import { buildFederatedSchema } from '../utils/buildFederatedSchema';

interface Req extends Request {
  user?: {
    user?: User;
    currentRole?: Role;
    roles?: Role[];
  };
}

const apolloServer = async (app: Express) => {
  const PATH = '/graphql';

  registerEnums();

  const schema = await buildFederatedSchema({
    resolvers: [
      __dirname + '/../resolvers/**/*Query.{ts,js}',
      __dirname + '/../resolvers/**/*Mutation.{ts,js}',
      __dirname + '/../resolvers/**/*Resolver.{ts,js}',
    ],
    validate: false,
  });

  const server = new ApolloServer({
    schema,
    tracing: false,
    playground: {
      settings: {
        // @ts-ignore-line igore until https://github.com/prisma-labs/graphql-playground/pull/1212 is merged
        'schema.polling.enable': false,
      },
    },

    context: async ({ req }: { req: Req }) => {
      let user = null;
      const userId = req.user?.user?.id as number;

      if (req.user) {
        user = {
          ...(await baseContext.queries.user.getAgent(userId)),
          currentRole:
            req.user.currentRole || (req.user.roles ? req.user.roles[0] : null),
        } as UserWithRole;
      }

      const context: ResolverContext = { ...baseContext, user };
      return context;
    },
  });
  server.applyMiddleware({ app: app, path: PATH });
};

export default apolloServer;
