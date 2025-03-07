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
import { VisitRegistrationStatus } from '../../models/VisitRegistration';
import { VisitRegistration } from '../types/VisitRegistration';

@ArgsType()
export class UpdateVisitRegistrationArgs {
  @Field(() => Int!)
  userId: number;

  @Field(() => Int!)
  visitId: number;

  @Field(() => Date, { nullable: true })
  trainingExpiryDate?: Date | null;

  @Field(() => Date, { nullable: true })
  startsAt?: Date | null;

  @Field(() => Date, { nullable: true })
  endsAt?: Date | null;

  status?: VisitRegistrationStatus;
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
