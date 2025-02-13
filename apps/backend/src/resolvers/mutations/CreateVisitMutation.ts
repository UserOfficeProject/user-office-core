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
export class CreateVisitArgs {
  @Field(() => Int)
  experimentPk: number;

  @Field(() => [Int])
  team: number[];

  @Field(() => Int)
  teamLeadUserId: number;
}

@Resolver()
export class CreateVisitMutation {
  @Mutation(() => Visit)
  createVisit(@Args() args: CreateVisitArgs, @Ctx() context: ResolverContext) {
    return context.mutations.visit.createVisit(context.user, args);
  }
}
