import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { PredefinedMessage as PredefinedMessageOrigin } from '../../models/PredefinedMessage';
import { BasicUserDetails } from './BasicUserDetails';

/**
 * NOTE: Predefined messages are used as a way to reuse some messages that are repeatable throughout the app.
 * For example feedback inputs, comments and other messages that are quite generic can be just selected from a list of predefined messages.
 * In the frontend we are going to have one component called FormikUIPredefinedMessagesTextField.
 * This is Textarea which is loading all predefined messages from the database filtered by some specific key.
 * It is easy to just search and select the message you want to use for that specific form input.
 */
@ObjectType()
export class PredefinedMessage implements Partial<PredefinedMessageOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public title: string;

  @Field(() => String)
  public message: string;

  @Field(() => Date)
  public dateModified: Date;

  @Field(() => Int)
  public lastModifiedBy: number;
}

@Resolver(() => PredefinedMessage)
export class PredefinedMessageResolver {
  @FieldResolver(() => BasicUserDetails)
  async modifiedBy(
    @Root() predefinedMessage: PredefinedMessageOrigin,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return await context.queries.user.getBasic(
      context.user,
      predefinedMessage.lastModifiedBy
    );
  }
}
