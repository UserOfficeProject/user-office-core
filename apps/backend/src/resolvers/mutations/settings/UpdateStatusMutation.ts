import { Ctx, Mutation, Resolver, Field, InputType, Arg } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { Status } from '../../types/Status';

@InputType()
export class UpdateStatusInput {
  @Field(() => String)
  public id: string;

  @Field(() => String, { nullable: true })
  public shortCode?: string;

  @Field(() => String, { nullable: true })
  public name?: string;

  @Field(() => String, { nullable: true })
  public description?: string;

  @Field(() => Boolean, { nullable: true })
  public isDefault?: boolean;
}

@Resolver()
export class UpdateStatusMutation {
  @Mutation(() => Status)
  async updateStatus(
    @Ctx() context: ResolverContext,
    @Arg('updatedStatusInput')
    updatedStatusInput: UpdateStatusInput
  ) {
    return context.mutations.status.updateStatus(
      context.user,
      updatedStatusInput
    );
  }
}
