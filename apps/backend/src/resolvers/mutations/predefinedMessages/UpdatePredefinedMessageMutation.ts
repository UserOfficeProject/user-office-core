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
export class UpdatePredefinedMessageInput
  implements Partial<PredefinedMessageModel>
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
  @Mutation(() => PredefinedMessage)
  updatePredefinedMessage(
    @Arg('updatePredefinedMessageInput')
    updatePredefinedMessageInput: UpdatePredefinedMessageInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.predefinedMessage.update(
      context.user,
      updatePredefinedMessageInput
    );
  }
}
