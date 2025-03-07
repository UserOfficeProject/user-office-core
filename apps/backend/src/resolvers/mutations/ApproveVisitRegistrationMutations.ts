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
export class ApproveVisitRegistrationsMutation {
  @Mutation(() => [VisitRegistration])
  async approveVisitRegistrations(
    @Arg('visitRegistrations', () => [ApproveVisitRegistrationInput])
    visitRegistrations: [ApproveVisitRegistrationInput],
    @Ctx() context: ResolverContext
  ) {
    const approveResults = await Promise.all(
      visitRegistrations.map((visitRegistration) =>
        context.mutations.visit.approveVisitRegistration(
          context.user,
          visitRegistration
        )
      )
    );

    const rejections = approveResults.filter((result) => isRejection(result));

    if (rejections.length > 0) {
      logger.logWarn('Approve visit registration failed', {
        rejections,
      });

      return rejection('APPROVE_VISIT_REGISTRATION_FAILED');
    }

    return approveResults as VisitRegistration[];
  }
}
