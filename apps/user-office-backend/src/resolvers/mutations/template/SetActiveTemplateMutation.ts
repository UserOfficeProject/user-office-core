import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import { TemplateGroupId } from '../../../models/Template';

@ArgsType()
export class SetActiveTemplateArgs {
  @Field(() => TemplateGroupId)
  public templateGroupId: TemplateGroupId;

  @Field(() => Int)
  public templateId: number;
}

@Resolver()
export class SetActiveTemplateMutation {
  @Mutation(() => Boolean)
  setActiveTemplate(
    @Args() args: SetActiveTemplateArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.template.setActiveTemplate(context.user, args);
  }
}
