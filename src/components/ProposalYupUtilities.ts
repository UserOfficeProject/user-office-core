import { DataType, QuestionaryField } from "../models/ProposalModel";
import * as Yup from "yup";

export const createFormikCofigObjects = (
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
  switch (field.data_type) {
    case DataType.TEXT_INPUT:
      let txtInputSchema = Yup.string();
      field.config.required &&
        (txtInputSchema = txtInputSchema.required(`This is a required field`));
      field.config.min &&
        (txtInputSchema = txtInputSchema.min(
          field.config.min,
          `Value must be at least ${field.config.min} characters`
        ));
      field.config.max &&
        (txtInputSchema = txtInputSchema.max(
          field.config.max,
          `Value must be at most ${field.config.max} characters`
        ));
      return txtInputSchema;
    case DataType.SELECTION_FROM_OPTIONS:
      let selectFromOptionsSchema = Yup.string();
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
