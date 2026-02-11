import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { EmailTemplate } from '../types/EmailTemplate';

@InputType()
export class CreateEmailTemplateInput {
  @Field(() => Int)
  public createdByUserId: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public description: string;

  @Field(() => Boolean)
  public useTemplateFile: boolean;

  @Field(() => String, { nullable: true })
  public subject?: string;

  @Field(() => String, { nullable: true })
  public body?: string;
}

@Resolver()
export class CreateEmailTemplateMutation {
  @Mutation(() => EmailTemplate)
  createEmailTemplate(
    @Arg('createEmailTemplateInput')
    createEmailTemplateInput: CreateEmailTemplateInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.emailTemplate.create(
      context.user,
      createEmailTemplateInput
    );
  }
}
