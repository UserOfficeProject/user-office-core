import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import { Template } from '../../types/Template';

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
  @Mutation(() => Template)
  updateTemplate(
    @Args() args: UpdateTemplateArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.template.updateTemplate(context.user, args);
  }
}
