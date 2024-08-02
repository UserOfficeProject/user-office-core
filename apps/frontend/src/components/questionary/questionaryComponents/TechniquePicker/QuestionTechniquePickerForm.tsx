import { Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import TextField from 'components/common/FormikUITextField';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { TechniquePickerConfig } from 'generated/sdk';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionTechniquePickerFormCommon } from './QuestionTechniquePickerFormCommon';
import { QuestionFormShell } from '../QuestionFormShell';

export const QuestionTechniquePickerForm = (props: QuestionFormProps) => {
  const field = props.question;
  const config = field.config as TechniquePickerConfig;
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

          <QuestionTechniquePickerFormCommon config={config} />
        </>
      )}
    </QuestionFormShell>
  );
};
