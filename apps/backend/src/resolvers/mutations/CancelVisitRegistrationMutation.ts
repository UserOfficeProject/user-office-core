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
export class CancelVisitRegistrationInput
  implements Partial<VisitRegistration>
{
  @Field(() => Int!)
  public visitId: number;

  @Field(() => Int!)
  public userId: number;
}

@Resolver()
export class CancelVisitRegistrationMutation {
  @Mutation(() => VisitRegistration)
  cancelVisitRegistration(
    @Arg('visitRegistration', () => CancelVisitRegistrationInput)
    visitRegistration: CancelVisitRegistrationInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.visit.cancelVisitRegistration(
      context.user,
      visitRegistration
    );
  }
}
