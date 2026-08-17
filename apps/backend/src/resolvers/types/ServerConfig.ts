import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class ServerConfig {
  @Field(() => String)
  public baseURL: string;
}
