import { ObjectType, Field, Int } from "type-graphql";

import { DataType } from "../../models/ProposalModel";

import { ProposalTemplateField as ProposalTemplateFieldOrigin } from "../../models/ProposalModel";
import { FieldDependency } from "./FieldDependency";

@ObjectType()
export class ProposalTemplateField
  implements Partial<ProposalTemplateFieldOrigin> {
  @Field()
  public proposal_question_id: string;

  @Field(() => DataType)
  public data_type: DataType;

  @Field(() => Int)
  public sort_order: number;

  @Field()
  public question: string;
  //public config: FieldConfig, // TODO strongly type this after making GraphQL accept union type configs

  @Field()
  public config: string;

  @Field(() => Int)
  public topic_id: number;

  @Field(() => [FieldDependency], { nullable: true })
  public dependencies: FieldDependency[] | null;
}
