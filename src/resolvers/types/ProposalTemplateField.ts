import { Field, Int, ObjectType } from "type-graphql";
import {
  DataType,
  ProposalTemplateField as ProposalTemplateFieldOrigin,
  FieldConfig
} from "../../models/ProposalModel";
import {
  BooleanConfig,
  DateConfig,
  EmbellishmentConfig,
  FileUploadConfig,
  SelectionFromOptionsConfig,
  TextInputConfig,
  FieldConfigType
} from "./FieldConfig";
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

  @Field(() => FieldConfigType)
  public config: FieldConfig;

  @Field(() => Int)
  public topic_id: number;

  @Field(() => [FieldDependency], { nullable: true })
  public dependencies: FieldDependency[] | null;
}
