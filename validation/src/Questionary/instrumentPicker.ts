import * as Yup from 'yup';
import { SchemaOf } from 'yup';
import { AnyObject } from 'yup/lib/types';

export const instrumentPickerValidationSchema = (field: any) => {
  const config = field.config;

  interface ValidationSchema {
    instrumentId: string | null | undefined;
    timeRequested: string | null | undefined;
  }

  let schema:
    | Yup.ArraySchema<SchemaOf<ValidationSchema>, AnyObject>
    | SchemaOf<ValidationSchema>;

  if (config.isMultipleSelect) {
    schema = Yup.array().of(
      Yup.object()
        .shape({
          instrumentId: Yup.string(),
          timeRequested: Yup.string(),
        })
        .nullable()
    );
    if (config.required) {
      schema = schema.required().min(1);
    }
    if (config.requestTime) {
      schema = Yup.array()
        .of(
          Yup.object().shape({
            instrumentId: Yup.string(),
            timeRequested: Yup.string()
              .required('Request time field is required')
              .test('is-number?', 'Requested time is not valid', (value) => {
                const timeValue = Number(value);
                if (
                  isNaN(timeValue) ||
                  timeValue <= 0 ||
                  !Number.isInteger(timeValue)
                )
                  return false;
                else return true;
              }),
          })
        )
        .required()
        .min(1);
    }
  } else {
    schema = Yup.object()
      .shape({
        instrumentId: Yup.string(),
        timeRequested: Yup.string(),
      })
      .nullable();
    if (config.required) {
      schema = schema.required();
    }
    if (config.requestTime) {
      schema = Yup.object()
        .shape({
          instrumentId: Yup.string(),
          timeRequested: Yup.string()
            .required('Request time field is required')
            .test('is-number?', 'Requested time is not valid', (value) => {
              const timeValue = Number(value);
              if (
                isNaN(timeValue) ||
                timeValue <= 0 ||
                !Number.isInteger(timeValue)
              )
                return false;
              else return true;
            }),
        })
        .nullable()
        .required('Field is required');
    }
  }

  return schema;
};
