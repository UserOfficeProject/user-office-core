import { Query, Ctx, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalStatusAction } from '../types/ProposalStatusAction';

@Resolver()
export class StatusActionsQuery {
  @Query(() => [ProposalStatusAction], { nullable: true })
  statusActions(@Ctx() context: ResolverContext) {
    return context.queries.proposalSettings.getStatusActions(context.user);
  }
}
