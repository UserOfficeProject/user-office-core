import { buildSubgraphSchema } from '@apollo/subgraph';
import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';
import { IResolvers, printSchemaWithDirectives } from '@graphql-tools/utils';
import gql from 'graphql-tag';
import deepMerge from 'lodash.merge';
import {
  buildSchema,
  BuildSchemaOptions,
  createResolversMap,
} from 'type-graphql';

import { customAuthChecker } from './custom-auth-checker';

export async function buildFederatedSchema(
  options: Omit<BuildSchemaOptions, 'skipCheck'>,
  referenceResolvers?: IResolvers
) {
  const schema = await buildSchema({
    ...options,
    skipCheck: true,
    authChecker: customAuthChecker,
    authMode: 'null',
  });

  const federatedSchema = buildSubgraphSchema({
    typeDefs: gql(printSchemaWithDirectives(schema)),
    // merge schema's resolvers with reference resolvers
    resolvers: deepMerge(
      createResolversMap(schema) as GraphQLResolverMap<unknown>,
      referenceResolvers
    ),
  });

  return federatedSchema;
}
