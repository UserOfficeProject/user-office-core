import { Query, Ctx, Resolver, Int, ArgsType, Field, Args } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Status } from '../types/Status';

@ArgsType()
export class StatusArgs {
  @Field(() => Int)
  statusId: number;

  @Field(() => String)
  entityType: 'proposal' | 'experiment';
}

@ArgsType()
export class StatusesArgs {
  @Field(() => String)
  entityType: 'proposal' | 'experiment';
}

@Resolver()
export class StatusQuery {
  @Query(() => Status, { nullable: true })
  status(@Args() args: StatusArgs, @Ctx() context: ResolverContext) {
    return context.queries.status.getStatus(
      context.user,
      args.statusId,
      args.entityType
    );
  }

  @Query(() => [Status], { nullable: true })
  statuses(@Args() args: StatusesArgs, @Ctx() context: ResolverContext) {
    return context.queries.status.getAllStatuses(context.user, args.entityType);
  }
}
