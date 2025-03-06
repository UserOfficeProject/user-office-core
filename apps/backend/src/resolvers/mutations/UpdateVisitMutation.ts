import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Visit } from '../types/Visit';

@ArgsType()
export class UpdateVisitArgs {
  @Field(() => Int)
  visitId: number;

  @Field(() => [Int], { nullable: true })
  team?: number[];

  @Field(() => Int, { nullable: true })
  teamLeadUserId?: number;
}

@Resolver()
export class UpdateVisitMutation {
  @Mutation(() => Visit)
  updateVisit(@Args() args: UpdateVisitArgs, @Ctx() context: ResolverContext) {
    return context.mutations.visit.updateVisit(context.user, args);
  }
}
