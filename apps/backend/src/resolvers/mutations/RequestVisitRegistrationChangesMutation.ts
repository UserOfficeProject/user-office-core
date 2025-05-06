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
import { VisitRegistration } from '../types/VisitRegistration';

@InputType()
export class RequestVisitRegistrationChangesInput
  implements Partial<VisitRegistration>
{
  @Field(() => Int!)
  public visitId: number;

  @Field(() => Int!)
  public userId: number;
}

@Resolver()
export class RequestVisitRegistrationChangesMutation {
  @Mutation(() => VisitRegistration)
  requestVisitRegistrationChanges(
    @Arg('visitRegistration', () => RequestVisitRegistrationChangesInput)
    visitRegistration: RequestVisitRegistrationChangesInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.visit.requestVisitRegistrationChanges(
      context.user,
      visitRegistration
    );
  }
}
