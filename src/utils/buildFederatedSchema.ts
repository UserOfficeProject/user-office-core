import { printSubgraphSchema, buildSubgraphSchema } from '@apollo/subgraph';
import { knownSubgraphDirectives } from '@apollo/subgraph/dist/directives';
import { addResolversToSchema, GraphQLResolverMap } from 'apollo-graphql';
import { specifiedDirectives } from 'graphql';
import gql from 'graphql-tag';
import {
  buildSchema,
  BuildSchemaOptions,
  createResolversMap,
} from 'type-graphql';

import { ResolverContext } from '../context';

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

  const federatedSchema = buildSubgraphSchema({
    typeDefs: gql(printSubgraphSchema(schema)),
    resolvers: createResolversMap(
      schema
    ) as GraphQLResolverMap<ResolverContext>,
  });

  if (referenceResolvers) {
    addResolversToSchema(federatedSchema, referenceResolvers);
  }

  return federatedSchema;
}
