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
export class CancelVisitRegistrationArgs {
  @Field(() => Int!)
  userId: number;

  @Field(() => Int!)
  visitId: number;
}

@Resolver()
export class CancelVisitRegistrationMutation {
  @Mutation(() => VisitRegistration)
  cancelVisitRegistration(
    @Args() args: CancelVisitRegistrationArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.visit.cancelVisitRegistration(context.user, args);
  }
}
