import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateGroupId } from '../../models/Template';
import { TemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

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
  @Mutation(() => TemplateResponseWrap)
  createTemplate(
    @Ctx() context: ResolverContext,
    @Args() args: CreateTemplateArgs
  ) {
    return wrapResponse(
      context.mutations.template.createTemplate(context.user, args),
      TemplateResponseWrap
    );
  }
}
