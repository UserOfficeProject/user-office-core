import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import {
  PredefinedMessage,
  PredefinedMessageKey,
} from '../../../models/PredefinedMessage';
import { PredefinedMessageResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@InputType()
export class UpdatePredefinedMessageInput
  implements Partial<PredefinedMessage>
{
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public shortCode: string;

  @Field(() => String)
  public message: string;

  @Field(() => PredefinedMessageKey)
  public key: PredefinedMessageKey;
}

@Resolver()
export class UpdatePredefinedMessageMutation {
  @Mutation(() => PredefinedMessageResponseWrap)
  updatePredefinedMessage(
    @Arg('updatePredefinedMessageInput')
    updatePredefinedMessageInput: UpdatePredefinedMessageInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.predefinedMessage.update(
        context.user,
        updatePredefinedMessageInput
      ),
      PredefinedMessageResponseWrap
    );
  }
}
