import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { PredefinedMessage } from '../../../models/PredefinedMessage';
import { PredefinedMessageResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@InputType()
export class CreatePredefinedMessageInput
  implements Partial<PredefinedMessage>
{
  @Field(() => String)
  public shortCode: string;

  @Field(() => String)
  public message: string;
}

@Resolver()
export class CreatePredefinedMessageMutation {
  @Mutation(() => PredefinedMessageResponseWrap)
  addTechnicalReview(
    @Arg('createPredefinedMessageInput')
    createPredefinedMessageInput: CreatePredefinedMessageInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.predefinedMessage.create(
        context.user,
        createPredefinedMessageInput
      ),
      PredefinedMessageResponseWrap
    );
  }
}
