/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLResolverMap } from 'apollo-graphql';

import { ResolverContext } from '../context';
import { resolveUserReference } from './types/User';

export default function federationSources(): {
  orphanedTypes: Array<{ new (): any }>;
  referenceResolvers: GraphQLResolverMap<ResolverContext>;
} {
  return {
    orphanedTypes: [],
    referenceResolvers: {
      User: { __resolveReference: resolveUserReference },
    },
  };
}
