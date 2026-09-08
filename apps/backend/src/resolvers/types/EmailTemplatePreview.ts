import { Field, Int, ObjectType } from 'type-graphql';

import { RenderErrorSource } from '../../utils/emailTemplateRenderer';

@ObjectType()
export class EmailTemplatePreviewError {
  constructor(
    source: RenderErrorSource,
    message: string,
    line?: number,
    column?: number
  ) {
    this.source = source;
    this.message = message;
    this.line = line;
    this.column = column;
  }

  @Field(() => String)
  public source: RenderErrorSource;

  @Field(() => String)
  public message: string;

  @Field(() => Int, { nullable: true })
  public line?: number;

  @Field(() => Int, { nullable: true })
  public column?: number;
}

@ObjectType()
export class EmailTemplatePreview {
  constructor(init: {
    subject?: string;
    body?: string;
    error?: EmailTemplatePreviewError;
    sourceSubject?: string;
    sourceBody?: string;
  }) {
    this.subject = init.subject;
    this.body = init.body;
    this.error = init.error;
    this.sourceSubject = init.sourceSubject;
    this.sourceBody = init.sourceBody;
  }

  @Field(() => String, { nullable: true })
  public subject?: string;

  @Field(() => String, { nullable: true })
  public body?: string;

  @Field(() => EmailTemplatePreviewError, { nullable: true })
  public error?: EmailTemplatePreviewError;

  // Populated only for file-based templates, so the client can detect which
  // variables a template it cannot see the source of expects.
  @Field(() => String, { nullable: true })
  public sourceSubject?: string;

  @Field(() => String, { nullable: true })
  public sourceBody?: string;
}
