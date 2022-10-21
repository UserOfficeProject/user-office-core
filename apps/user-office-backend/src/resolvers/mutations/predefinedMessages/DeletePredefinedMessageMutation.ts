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
export class DeletePredefinedMessageInput
  implements Partial<PredefinedMessage>
{
  @Field(() => Int)
  public id: number;
}

@Resolver()
export class DeletePredefinedMessageMutation {
  @Mutation(() => PredefinedMessageResponseWrap)
  deletePredefinedMessage(
    @Arg('deletePredefinedMessageInput')
    deletePredefinedMessageInput: DeletePredefinedMessageInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.predefinedMessage.delete(
        context.user,
        deletePredefinedMessageInput
      ),
      PredefinedMessageResponseWrap
    );
  }
}
