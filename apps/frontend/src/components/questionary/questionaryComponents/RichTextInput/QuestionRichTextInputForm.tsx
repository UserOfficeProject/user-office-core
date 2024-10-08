import { Field } from 'formik';
import React, { ChangeEvent } from 'react';
import * as Yup from 'yup';

import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import TextField from 'components/common/FormikUITextField';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { TextInputConfig } from 'generated/sdk';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

export const QuestionRichTextInputForm = (props: QuestionFormProps) => {
  const field = props.question;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  return (
    <QuestionFormShell
      {...props}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          required: Yup.boolean(),
        }),
      })}
    >
      {(formikProps) => (
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
            label="Question"
            id="Question-input"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <TitledContainer label="Constraints">
            <Field
              name="config.required"
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: 'Is required',
              }}
              data-cy="required"
            />
            <Field
              name="config.allowImages"
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: 'Allow images',
              }}
              data-cy="allow-images"
            />
            <Field
              name="config.max"
              label="Max"
              type="text"
              id="Max-input"
              component={TextField}
              fullWidth
              data-cy="max"
              onChange={({
                target: { value },
              }: ChangeEvent<HTMLInputElement>) => {
                formikProps.setFieldValue(
                  'config.max',
                  value.length === 0 ? null : value
                );
              }}
              value={(formikProps.values.config as TextInputConfig).max ?? ''}
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
