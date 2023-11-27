import { makeExecutableSchema } from '@graphql-tools/schema';
import { stitchSchemas } from '@graphql-tools/stitch';
import { GraphQLSchema } from 'graphql';

import { proposalViewBatchedResolver } from '../resolvers/queries/ProposalsViewQueryBatched';
import typeDefs from '../resolvers/types/ProposalViewBatched';

export const batchedSchema = makeExecutableSchema({
  typeDefs: typeDefs,
});

export async function buildStitchedSchema(federatedSchema: GraphQLSchema) {
  const sticthedSchema = stitchSchemas({
    subschemas: [federatedSchema, batchedSchema],
    resolvers: proposalViewBatchedResolver,
  });

  return sticthedSchema;
}
