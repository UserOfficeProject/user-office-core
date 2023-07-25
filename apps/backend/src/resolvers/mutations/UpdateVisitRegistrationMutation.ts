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
export class UpdateVisitRegistrationArgs {
  @Field(() => Int)
  visitId: number;

  @Field(() => Date, { nullable: true })
  trainingExpiryDate?: Date;

  @Field(() => Boolean, { nullable: true })
  isRegistrationSubmitted?: boolean;

  @Field(() => Date, { nullable: true })
  startsAt?: boolean;

  @Field(() => Date, { nullable: true })
  endsAt?: boolean;

  registrationQuestionaryId?: number;
}

@Resolver()
export class UpdateVisitRegistrationMutation {
  @Mutation(() => VisitRegistration)
  updateVisitRegistration(
    @Args() args: UpdateVisitRegistrationArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.visit.updateVisitRegistration(context.user, args);
  }
}
