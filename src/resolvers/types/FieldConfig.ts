import { createUnionType, Field, Int, ObjectType } from 'type-graphql';

import { Unit } from './Unit';

@ObjectType()
export class ConfigBase {
  @Field(() => String)
  small_label: string;

  @Field(() => Boolean)
  required: boolean;

  @Field(() => String)
  tooltip: string;
}

@ObjectType()
export class SampleBasisConfig {
  @Field(() => String)
  titlePlaceholder: string;
}

@ObjectType()
export class GenericTemplateBasisConfig {
  @Field(() => String)
  titlePlaceholder: string;

  @Field(() => String)
  questionLabel: string;
}

@ObjectType()
export class VisitBasisConfig extends ConfigBase {}

@ObjectType()
export class BooleanConfig extends ConfigBase {}

@ObjectType()
export class DateConfig extends ConfigBase {
  @Field(() => String, { nullable: true })
  minDate: string | null;

  @Field(() => String, { nullable: true })
  maxDate: string | null;

  @Field(() => String, { nullable: true })
  defaultDate: string | null;

  @Field(() => Boolean)
  includeTime: boolean;
}

@ObjectType()
export class EmbellishmentConfig {
  @Field(() => Boolean)
  omitFromPdf: boolean;

  @Field(() => String)
  html: string;

  @Field(() => String)
  plain: string;
}

@ObjectType()
export class FileUploadConfig extends ConfigBase {
  @Field(() => [String])
  file_type: string[];

  @Field(() => Int)
  max_files: number;
}

@ObjectType()
export class SelectionFromOptionsConfig extends ConfigBase {
  @Field(() => String)
  variant: string;

  @Field(() => [String])
  options: string[];

  @Field(() => Boolean)
  isMultipleSelect: boolean;
}

@ObjectType()
export class TextInputConfig extends ConfigBase {
  @Field(() => Int, { nullable: true })
  min: number | null;

  @Field(() => Int, { nullable: true })
  max: number | null;

  @Field(() => Boolean)
  multiline: boolean;

  @Field(() => String)
  placeholder: string;

  @Field(() => String, { nullable: true })
  htmlQuestion: string;

  @Field(() => Boolean)
  isHtmlQuestion: boolean;

  @Field(() => Boolean)
  isCounterHidden: boolean;
}

@ObjectType()
export class ShipmentBasisConfig extends ConfigBase {}

@ObjectType()
export class FeedbackBasisConfig extends ConfigBase {}

@ObjectType()
export class SubTemplateConfig {
  @Field(() => Int, { nullable: true })
  minEntries: number | null;

  @Field(() => Int, { nullable: true })
  maxEntries: number | null;

  @Field(() => Int, { nullable: true })
  templateId: number | null;

  @Field(() => String)
  templateCategory: string;

  @Field(() => String)
  addEntryButtonLabel: string;

  @Field(() => String)
  small_label: string;

  @Field(() => Boolean)
  required: boolean;
}

@ObjectType()
export class SampleDeclarationConfig extends SubTemplateConfig {
  @Field(() => Int, { nullable: true })
  esiTemplateId: number | null;
}
@ObjectType()
export class IntervalConfig extends ConfigBase {
  @Field(() => [Unit])
  units: Unit[];
}

export enum NumberValueConstraint {
  NONE = 'NONE',
  ONLY_POSITIVE = 'ONLY_POSITIVE',
  ONLY_NEGATIVE = 'ONLY_NEGATIVE',
}

@ObjectType()
export class NumberInputConfig extends ConfigBase {
  @Field(() => [Unit])
  units: Unit[];

  @Field(() => NumberValueConstraint, { nullable: true })
  numberValueConstraint: NumberValueConstraint | null;
}

@ObjectType()
export class ProposalBasisConfig {
  @Field(() => String)
  tooltip: string;
}

@ObjectType()
export class ProposalEsiBasisConfig {
  @Field(() => String)
  tooltip: string;
}

@ObjectType()
export class SampleEsiBasisConfig {
  @Field(() => String)
  tooltip: string;
}

@ObjectType()
export class RichTextInputConfig extends ConfigBase {
  @Field(() => Int, { nullable: true })
  max: number | null;
}

export const FieldConfigType = createUnionType({
  name: 'FieldConfig', // the name of the GraphQL union
  types: () => [
    BooleanConfig,
    DateConfig,
    EmbellishmentConfig,
    FileUploadConfig,
    SelectionFromOptionsConfig,
    TextInputConfig,
    SampleBasisConfig,
    SampleDeclarationConfig,
    SampleEsiBasisConfig,
    SubTemplateConfig,
    ProposalBasisConfig,
    ProposalEsiBasisConfig,
    IntervalConfig,
    NumberInputConfig,
    ShipmentBasisConfig,
    RichTextInputConfig,
    VisitBasisConfig,
    GenericTemplateBasisConfig,
    FeedbackBasisConfig,
  ], // function that returns array of object types classes
});
