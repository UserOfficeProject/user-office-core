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
import { VisitRegistrationResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateVisitRegistrationArgs {
  @Field(() => Int!)
  visitId: number;

  @Field(() => Date, { nullable: true })
  trainingExpiryDate?: Date;

  @Field(() => Boolean, { nullable: true })
  isRegistrationSubmitted?: boolean;

  registrationQuestionaryId?: number;
}

@Resolver()
export class UpdateVisitRegistrationMutation {
  @Mutation(() => VisitRegistrationResponseWrap)
  updateVisitRegistration(
    @Args() args: UpdateVisitRegistrationArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.visit.updateVisitRegistration(context.user, args),
      VisitRegistrationResponseWrap
    );
  }
}
