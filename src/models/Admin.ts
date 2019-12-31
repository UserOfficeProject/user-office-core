import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
export class Page {
  @Field(() => Int)
  public id: number;

  @Field({ nullable: true })
  public content: string;

  constructor(id: number, content: string) {
    this.id = id;
    this.content = content;
  }
}
