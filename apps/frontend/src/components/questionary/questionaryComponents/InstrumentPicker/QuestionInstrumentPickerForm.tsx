import { Field } from 'formik';
import { TextField } from 'formik-mui';
import React from 'react';
import * as Yup from 'yup';

import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';
import { QuestionInstrumentPickerFormCommon } from './QuestionInstrumentPickerFormCommon';

export const QuestionInstrumentPickerForm = (props: QuestionFormProps) => {
  const field = props.question;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  return (
    <QuestionFormShell
      {...props}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          required: Yup.bool(),
          variant: Yup.string().required('Variant is required'),
        }),
      })}
    >
      {() => (
        <>
          <Field
            name="naturalKey"
            label="Key"
            id="Key-input"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />
          <Field
            name="question"
            id="Question-input"
            label="Question"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <QuestionInstrumentPickerFormCommon />
        </>
      )}
    </QuestionFormShell>
  );
};
