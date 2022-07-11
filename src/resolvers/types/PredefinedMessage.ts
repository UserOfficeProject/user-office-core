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

@ObjectType()
export class PredefinedMessage implements Partial<PredefinedMessageOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public shortCode: string;

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
