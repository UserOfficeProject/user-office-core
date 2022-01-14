import { printSubgraphSchema, buildSubgraphSchema } from '@apollo/subgraph';
import { knownSubgraphDirectives } from '@apollo/subgraph/dist/directives';
import { addResolversToSchema, GraphQLResolverMap } from 'apollo-graphql';
import { specifiedDirectives } from 'graphql';
import { applyMiddleware } from 'graphql-middleware';
import gql from 'graphql-tag';
import {
  buildSchema,
  BuildSchemaOptions,
  createResolversMap,
} from 'type-graphql';

import { ResolverContext } from '../context';
import rejectionLogger from '../middlewares/rejectionLogger';
import rejectionSanitizer from '../middlewares/rejectionSanitizer';

export async function buildFederatedSchema(
  options: Omit<BuildSchemaOptions, 'skipCheck'>,
  referenceResolvers?: GraphQLResolverMap<ResolverContext>
) {
  const schema = await buildSchema({
    ...options,
    directives: [
      ...specifiedDirectives,
      ...knownSubgraphDirectives,
      ...(options.directives || []),
    ],
    skipCheck: true,
  });

  let federatedSchema = buildSubgraphSchema({
    typeDefs: gql(printSubgraphSchema(schema)),
    resolvers: createResolversMap(
      schema
    ) as GraphQLResolverMap<ResolverContext>,
  });

  const env = process.env.NODE_ENV;

  // NOTE: applyMiddleware must be before addResolversToSchema as a workaround for the issue: https://github.com/maticzav/graphql-middleware/issues/395
  if (env === 'production') {
    // prevent exposing too much information when running in production
    federatedSchema = applyMiddleware(federatedSchema, rejectionSanitizer);
  } else {
    federatedSchema = applyMiddleware(federatedSchema, rejectionLogger);
  }

  if (referenceResolvers) {
    addResolversToSchema(federatedSchema, referenceResolvers);
  }

  return federatedSchema;
}
