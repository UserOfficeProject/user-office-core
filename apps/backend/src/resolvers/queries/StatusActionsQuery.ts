import { Query, Ctx, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { StatusAction } from '../types/StatusAction';

@Resolver()
export class StatusActionsQuery {
  @Query(() => [StatusAction], { nullable: true })
  statusActions(@Ctx() context: ResolverContext) {
    return context.queries.statusAction.getStatusActions(context.user);
  }
}
