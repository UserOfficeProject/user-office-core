import { logger } from '@user-office-software/duo-logger';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection, rejection } from '../../models/Rejection';
import { VisitRegistration } from '../types/VisitRegistration';

@InputType()
export class ApproveVisitRegistrationInput
  implements Partial<VisitRegistration>
{
  @Field(() => Int!)
  public visitId: number;

  @Field(() => Int!)
  public userId: number;
}

@Resolver()
export class ApproveVisitRegistrationMutation {
  @Mutation(() => VisitRegistration)
  async approveVisitRegistration(
    @Arg('visitRegistration', () => ApproveVisitRegistrationInput)
    visitRegistration: ApproveVisitRegistrationInput,
    @Ctx() context: ResolverContext
  ) {
    const approveResult = context.mutations.visit.approveVisitRegistration(
      context.user,
      visitRegistration
    );

    if (isRejection(approveResult)) {
      logger.logWarn('Approve visit registration failed', {
        approveResult,
      });

      return rejection('APPROVE_VISIT_REGISTRATION_FAILED');
    }

    return approveResult;
  }
}
