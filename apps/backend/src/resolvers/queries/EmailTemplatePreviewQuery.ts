import { Arg, Ctx, Field, InputType, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { EmailTemplatePreview } from '../types/EmailTemplatePreview';

@InputType()
export class EmailTemplatePreviewVariableInput {
  @Field(() => String)
  public key: string;

  @Field(() => String)
  public value: string;
}

@InputType()
export class EmailTemplatePreviewInput {
  // Required when useTemplateFile is true: the stored name is used to resolve
  // the template file, never a client-supplied one.
  @Field(() => Int, { nullable: true })
  public emailTemplateId?: number;

  @Field(() => String, { nullable: true })
  public subject?: string;

  @Field(() => String, { nullable: true })
  public body?: string;

  @Field(() => Boolean, { defaultValue: false })
  public useTemplateFile: boolean;

  @Field(() => [EmailTemplatePreviewVariableInput], { defaultValue: [] })
  public variables: EmailTemplatePreviewVariableInput[];
}

@Resolver()
export class EmailTemplatePreviewQuery {
  @Query(() => EmailTemplatePreview, { nullable: true })
  emailTemplatePreview(
    @Arg('emailTemplatePreviewInput')
    emailTemplatePreviewInput: EmailTemplatePreviewInput,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.emailTemplate.preview(
      context.user,
      emailTemplatePreviewInput
    );
  }
}
