import { createUnionType, Field, Int, ObjectType } from 'type-graphql';

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
export class BooleanConfig extends ConfigBase {}

@ObjectType()
export class DateConfig extends ConfigBase {}

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
}

@ObjectType()
export class SubtemplateConfig {
  @Field(() => Int, { nullable: true })
  maxEntries: number | null;

  @Field(() => Int)
  templateId: number;

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
export class ProposalBasisConfig {
  @Field(() => String)
  tooltip: string;
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
    SubtemplateConfig,
    ProposalBasisConfig,
  ], // function that returns array of object types classes
});
