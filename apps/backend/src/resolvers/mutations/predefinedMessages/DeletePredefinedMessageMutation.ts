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
import { PredefinedMessage as PredefinedMessageModel } from '../../../models/PredefinedMessage';
import { PredefinedMessage } from '../../types/PredefinedMessage';

@InputType()
export class DeletePredefinedMessageInput
  implements Partial<PredefinedMessageModel>
{
  @Field(() => Int)
  public id: number;
}

@Resolver()
export class DeletePredefinedMessageMutation {
  @Mutation(() => PredefinedMessage)
  deletePredefinedMessage(
    @Arg('deletePredefinedMessageInput')
    deletePredefinedMessageInput: DeletePredefinedMessageInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.predefinedMessage.delete(
      context.user,
      deletePredefinedMessageInput
    );
  }
}
