import * as Yup from 'yup';

import {
  FieldConfig,
  Answer,
  SelectionFromOptionsConfig,
  TextInputConfig,
} from '../../generated/sdk';
import { DataType } from '../../generated/sdk';

const toYupValidationSchema = (field: Answer): Yup.Schema<any> => {
  let config: FieldConfig;
  switch (field.question.dataType) {
    case DataType.TEXT_INPUT:
      let txtInputSchema = Yup.string();
      config = field.question.config as TextInputConfig;
      field.question.config.required &&
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
      config = field.question.config as SelectionFromOptionsConfig;
      field.question.config.required &&
        (selectFromOptionsSchema = selectFromOptionsSchema.required(
          `This is a required field`
        ));

      return selectFromOptionsSchema;
    case DataType.DATE:
      let dateSchema = Yup.date();
      field.question.config.required &&
        (dateSchema = dateSchema.required(`This date is required`));

      return dateSchema;
    case DataType.BOOLEAN:
      let booleanSchema = Yup.bool();

      field.question.config.required &&
        (booleanSchema = booleanSchema
          .oneOf([true], 'This field is required')
          .required('This field is required'));

      return booleanSchema;
    default:
      return Yup.string();
  }
};

const toYupInitialValues = (field: Answer): any => {
  return field.value;
};

export const createFormikConfigObjects = (
  fields: Answer[]
): { validationSchema: any; initialValues: any } => {
  const validationSchema: any = {};
  const initialValues: any = {};

  fields.forEach(field => {
    validationSchema[field.question.proposalQuestionId] = toYupValidationSchema(
      field
    );
    initialValues[field.question.proposalQuestionId] = toYupInitialValues(
      field
    );
  });

  return { initialValues, validationSchema };
};
