import { Field, ObjectType, Int } from 'type-graphql';

@ObjectType()
export class TemplateVersion {
  @Field(() => Int, { nullable: true })
  public templateVersionId: number;

  @Field(() => Int)
  public templateId: number;

  @Field(() => String, { nullable: true })
  public template: string;

  @Field(() => Int)
  public versionNumber: number;

  @Field(() => String)
  public templateType: string;

  @Field(() => String)
  public createdTimeStamp: string;
}
