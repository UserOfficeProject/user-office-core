/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLResolverMap } from 'apollo-graphql';

import { ResolverContext } from '../context';
import { resolveBasicUserDetailsReference } from './types/BasicUserDetails';
import { resolveCallReference } from './types/Call';
import { resolveInstrumentReference } from './types/Instrument';
import { resolveProposalReference } from './types/Proposal';
import { resolveUserReference } from './types/User';

export default function federationSources(): {
  orphanedTypes: Array<{ new (): any }>;
  referenceResolvers: GraphQLResolverMap<ResolverContext>;
} {
  return {
    orphanedTypes: [],
    referenceResolvers: {
      User: { __resolveReference: resolveUserReference },
      BasicUserDetails: {
        __resolveReference: resolveBasicUserDetailsReference,
      },
      Proposal: { __resolveReference: resolveProposalReference },
      Call: { __resolveReference: resolveCallReference },
      Instrument: { __resolveReference: resolveInstrumentReference },
    },
  };
}
