import { DateTime } from 'luxon';
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
import { DateWithoutTimezone } from '../CustomScalars';
import { VisitRegistration } from '../types/VisitRegistration';

@ArgsType()
export class UpdateVisitRegistrationArgs {
  @Field(() => Int!)
  userId: number;

  @Field(() => Int!)
  visitId: number;

  @Field(() => DateWithoutTimezone, { nullable: true })
  startsAt?: DateTime | null;

  @Field(() => DateWithoutTimezone, { nullable: true })
  endsAt?: DateTime | null;

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
