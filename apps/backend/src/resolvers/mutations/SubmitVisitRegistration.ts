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
import { VisitRegistration } from '../types/VisitRegistration';

@ArgsType()
export class SubmitVisitRegistrationArgs {
  @Field(() => Int!)
  userId: number;

  @Field(() => Int!)
  visitId: number;
}

@Resolver()
export class SubmitVisitRegistrationMutation {
  @Mutation(() => VisitRegistration)
  submitVisitRegistration(
    @Args() args: SubmitVisitRegistrationArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.visit.submitVisitRegistration(context.user, args);
  }
}
