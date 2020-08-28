import { Request } from 'express';
import express from 'express';
import graphqlHTTP, { RequestInfo } from 'express-graphql';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';

import baseContext from '../buildContext';
import { ResolverContext } from '../context';
import { Role } from '../models/Role';
import { User, UserWithRole } from '../models/User';
import { registerEnums } from '../resolvers/registerEnums';
import { logger } from '../utils/Logger';

const router = express.Router();

interface Req extends Request {
  user?: {
    user?: User;
    currentRole?: Role;
    roles?: Role[];
  };
}

const extensions = async (info: RequestInfo) => {
  if (info.result.errors) {
    logger.logError('Failed GRAPHQL execution', {
      result: info.result,
      operationName: info.operationName,
      user: info.context.user,
    });
  }
};

const graphql = async () => {
  registerEnums();

  const schema = await buildSchema({
    resolvers: [
      __dirname + '/../resolvers/**/*Query.{ts,js}',
      __dirname + '/../resolvers/**/*Mutation.{ts,js}',
      __dirname + '/../resolvers/**/*Resolver.{ts,js}',
    ],
    validate: false,
  });

  router.use(
    '/graphql',
    graphqlHTTP(async (req: Req) => {
      // Adds the currently logged-in user to the context object, which makes it available to the resolvers
      // The user sends a JWT token that is decrypted, this JWT token contains information about roles and ID
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

      return {
        schema,
        graphiql: true,
        context,
        extensions,
      };
    })
  );

  return router;
};

export default graphql;
