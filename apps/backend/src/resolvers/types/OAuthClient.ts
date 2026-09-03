import { ObjectType, Field } from 'type-graphql';

import { OAuthClient as OAuthClientOrigin } from '../../models/OAuthClient';

@ObjectType()
export class OAuthClient implements Partial<OAuthClientOrigin> {
  @Field()
  public id: string;

  @Field()
  public name: string;

  @Field(() => String, { nullable: true })
  public description: string | null;

  @Field(() => String, { nullable: true })
  public accessPermissions: string | null;

  @Field()
  public createdAt: Date;

  @Field()
  public updatedAt: Date;
}
