import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { TemplateGroupId } from '../../../models/Template';
import { Template } from '../../types/Template';

@ArgsType()
export class CreateTemplateArgs {
  @Field(() => TemplateGroupId)
  groupId: TemplateGroupId;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;
}
@Resolver()
export class CreateTemplateMutation {
  @Mutation(() => Template)
  createTemplate(
    @Ctx() context: ResolverContext,
    @Args() args: CreateTemplateArgs
  ) {
    return context.mutations.template.createTemplate(context.user, args);
  }
}
