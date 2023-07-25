import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { PredefinedMessage as PredefinedMessageModel } from '../../../models/PredefinedMessage';
import { PredefinedMessage } from '../../types/PredefinedMessage';

@InputType()
export class CreatePredefinedMessageInput
  implements Partial<PredefinedMessageModel>
{
  @Field(() => String)
  public title: string;

  @Field(() => String)
  public message: string;

  @Field(() => String)
  public key: string;
}

@Resolver()
export class CreatePredefinedMessageMutation {
  @Mutation(() => PredefinedMessage)
  createPredefinedMessage(
    @Arg('createPredefinedMessageInput')
    createPredefinedMessageInput: CreatePredefinedMessageInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.predefinedMessage.create(
      context.user,
      createPredefinedMessageInput
    );
  }
}
