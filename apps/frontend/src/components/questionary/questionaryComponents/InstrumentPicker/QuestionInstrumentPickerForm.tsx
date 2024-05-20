import { Field } from 'formik';
import { TextField } from 'formik-mui';
import React from 'react';
import * as Yup from 'yup';

import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { InstrumentPickerConfig } from 'generated/sdk';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionInstrumentPickerFormCommon } from './QuestionInstrumentPickerFormCommon';
import TemplateEditLabel from '../../../template/QuestionTemplateLabel';
import { QuestionFormShell } from '../QuestionFormShell';
export const QuestionInstrumentPickerForm = (props: QuestionFormProps) => {
  const field = props.question;
  const config = field.config as InstrumentPickerConfig;
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
          <TemplateEditLabel pageType="Question" />
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

          <QuestionInstrumentPickerFormCommon config={config} />
        </>
      )}
    </QuestionFormShell>
  );
};
