import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class OrcIDInformation {
  @Field(() => String, { nullable: true })
  firstname: string;

  @Field(() => String, { nullable: true })
  lastname: string;

  @Field(() => String, { nullable: true })
  orcid: string;

  @Field(() => String, { nullable: true })
  orcidHash: string;

  @Field(() => String, { nullable: true })
  refreshToken: string;

  @Field(() => String, { nullable: true })
  token?: string;
}
