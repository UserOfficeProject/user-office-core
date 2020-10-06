import * as Yup from 'yup';

import {
  Answer,
  DataType,
  SelectionFromOptionsConfig,
  TextInputConfig,
} from 'generated/sdk';

const toYupValidationSchema = (field: Answer): Yup.Schema<any> => {
  switch (field.question.dataType) {
    case DataType.TEXT_INPUT: {
      let schema = Yup.string();
      const config = field.config as TextInputConfig;
      field.config.required &&
        (schema = schema.required(`This is a required field`));
      config.min &&
        (schema = schema.min(
          config.min,
          `Value must be at least ${config.min} characters`
        ));
      config.max &&
        (schema = schema.max(
          config.max,
          `Value must be at most ${config.max} characters`
        ));

      return schema;
    }
    case DataType.SELECTION_FROM_OPTIONS: {
      let schema = Yup.string();
      const config = field.config as SelectionFromOptionsConfig;
      config.required && (schema = schema.required(`This is a required field`));

      return schema;
    }
    case DataType.DATE: {
      let schema = Yup.date();
      field.config.required &&
        (schema = schema.required(`This date is required`));

      return schema;
    }
    case DataType.BOOLEAN: {
      let schema = Yup.bool();

      field.config.required &&
        (schema = schema
          .oneOf([true], 'This field is required')
          .required('This field is required'));

      return schema;
    }

    case DataType.SAMPLE_BASIS:
      const schema = Yup.object().shape({});

      return schema;
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
