import * as Yup from "yup";
import {
  FieldConfig,
  QuestionaryField,
  SelectionFromOptionsConfig,
  TextInputConfig
} from "../../generated/sdk";
import { DataType } from "../../generated/sdk";

export const createFormikConfigObjects = (
  fields: QuestionaryField[]
): { validationSchema: any; initialValues: any } => {
  let validationSchema: any = {};
  let initialValues: any = {};

  fields.forEach(field => {
    validationSchema[field.proposal_question_id] = toYupValidationSchema(field);
    initialValues[field.proposal_question_id] = toYupInitialValues(field);
  });

  return { initialValues, validationSchema };
};

const toYupValidationSchema = (field: QuestionaryField): Yup.Schema<any> => {
  let config: FieldConfig;
  switch (field.data_type) {
    case DataType.TEXT_INPUT:
      let txtInputSchema = Yup.string();
      config = field.config as TextInputConfig;
      field.config.required &&
        (txtInputSchema = txtInputSchema.required(`This is a required field`));
      config.min &&
        (txtInputSchema = txtInputSchema.min(
          config.min,
          `Value must be at least ${config.min} characters`
        ));
      config.max &&
        (txtInputSchema = txtInputSchema.max(
          config.max,
          `Value must be at most ${config.max} characters`
        ));
      return txtInputSchema;
    case DataType.SELECTION_FROM_OPTIONS:
      let selectFromOptionsSchema = Yup.string();
      config = field.config as SelectionFromOptionsConfig;
      field.config.required &&
        (selectFromOptionsSchema = selectFromOptionsSchema.required(
          `This is a required field`
        ));
      return selectFromOptionsSchema;
    case DataType.DATE:
      let dateSchema = Yup.date();
      field.config.required &&
        (dateSchema = dateSchema.required(`This date is required`));
      return dateSchema;
    case DataType.BOOLEAN:
      let booleanSchema = Yup.bool();

      field.config.required &&
        (booleanSchema = booleanSchema
          .oneOf([true], "This field is required")
          .required("This field is required"));
      return booleanSchema;
    default:
      return Yup.string();
  }
};

const toYupInitialValues = (field: QuestionaryField): any => {
  return field.value;
};
