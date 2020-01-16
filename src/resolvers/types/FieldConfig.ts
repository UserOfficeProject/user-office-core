import { Field, Int, ObjectType, createUnionType } from "type-graphql";

// TODO go over and make sure the nullability is correct
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
export class BooleanConfig extends ConfigBase {}

@ObjectType()
export class DateConfig extends ConfigBase {}

@ObjectType()
export class EmbellishmentConfig extends ConfigBase {
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
  @Field(() => Int)
  min: number;

  @Field(() => Int)
  max: number;

  @Field(() => Boolean)
  multiline: boolean;

  @Field(() => String)
  placeholder: string;
}

export const FieldConfigType = createUnionType({
  name: "FieldConfig", // the name of the GraphQL union
  types: () => [
    BooleanConfig,
    DateConfig,
    EmbellishmentConfig,
    FileUploadConfig,
    SelectionFromOptionsConfig,
    TextInputConfig
  ] // function that returns array of object types classes
});
