import { Field, Int, ObjectType } from "type-graphql";
import { AbstractResponseWrap, wrapResponse } from "../Utils";

@ObjectType()
export class IntIdWrapper extends AbstractResponseWrap<number> {
  @Field(() => Int, { nullable: true })
  public id: number;

  setValue(value: number): void {
    this.id = value;
  }
}

export const wrapIntId = wrapResponse<number>(new IntIdWrapper());
