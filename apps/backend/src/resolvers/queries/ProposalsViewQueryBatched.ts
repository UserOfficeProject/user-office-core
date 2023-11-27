import { logger } from '@user-office-software/duo-logger';
import DataLoader from 'dataloader';

import { ResolverContext } from '../../context';
import { ProposalViewBatched } from '../types/ProposalViewBatched';
import { ProposalsFilter } from './ProposalsQuery';

let ctx: ResolverContext;
export const proposalViewBatchedResolver = {
  AllocationTimeUnits: {
    Day: 'day',
    Hour: 'hour',
  },
  Query: {
    proposalsViewBatched: (
      parent: ProposalViewBatched,
      args: {
        offset: number;
        first: number;
        filter: ProposalsFilter;
        sortField: string;
        sortDirection: string;
        searchText: string;
      },
      context: ResolverContext
    ) => {
      return context.queries.proposal.getAllView(
        context.user,
        args.filter,
        args.first,
        args.offset,
        args.sortField,
        args.sortDirection,
        args.searchText
      );
    },
    instrumentScientistProposalsBatched: (
      parent: ProposalViewBatched,
      args: { offset: number; first: number; filter: ProposalsFilter },
      context: ResolverContext
    ) => {
      return context.queries.proposal.getInstrumentScientistProposals(
        context.user,
        args.filter,
        args.first,
        args.offset
      );
    },
  },
  ProposalViewBatched: {
    principalInvestigator: (
      parent: ProposalViewBatched,
      args: undefined,
      context: ResolverContext
    ) => {
      try {
        ctx = context;

        return loader.load(parent.principalInvestigatorId);
      } catch (error) {
        logger.logException('Exception encountered : ', error);
      }
    },
  },
};

const loader = new DataLoader(async (keys: readonly number[]) => {
  logger.logInfo(`Fetching the user details for user id  ${keys}`, {});

  const usersList = await ctx.queries.user.getUsers(ctx.user, keys);
  const result = keys.map((id) => {
    return usersList?.find((user) => user.id === id);
  });

  return Promise.resolve(result);
});
