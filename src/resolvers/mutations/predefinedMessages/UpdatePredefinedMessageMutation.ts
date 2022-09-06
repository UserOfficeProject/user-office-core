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
import { PredefinedMessage } from '../../../models/PredefinedMessage';
import { PredefinedMessageResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@InputType()
export class UpdatePredefinedMessageInput
  implements Partial<PredefinedMessage>
{
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public title: string;

  @Field(() => String)
  public message: string;

  @Field(() => String)
  public key: string;
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
