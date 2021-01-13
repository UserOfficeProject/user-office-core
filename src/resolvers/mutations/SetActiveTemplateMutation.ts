import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateCategoryId } from '../../models/Template';
import { SuccessResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class SetActiveTemplateArgs {
  @Field(() => TemplateCategoryId)
  public templateCategoryId: TemplateCategoryId;

  @Field(() => Int)
  public templateId: number;
}

@Resolver()
export class SetActiveTemplateMutation {
  @Mutation(() => SuccessResponseWrap)
  setActiveTemplate(
    @Args() args: SetActiveTemplateArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.setActiveTemplate(context.user, args),
      SuccessResponseWrap
    );
  }
}
