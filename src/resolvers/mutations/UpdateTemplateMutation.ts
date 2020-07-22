import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateTemplateArgs {
  @Field(() => Int)
  public templateId: number;

  @Field({ nullable: true })
  public name: string;

  @Field({ nullable: true })
  public description: string;

  @Field({ nullable: true })
  public isArchived: boolean;
}

@Resolver()
export class UpdateTemplateMutation {
  @Mutation(() => TemplateResponseWrap)
  updateTemplate(
    @Args() args: UpdateTemplateArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.updateTemplate(context.user, args),
      TemplateResponseWrap
    );
  }
}
