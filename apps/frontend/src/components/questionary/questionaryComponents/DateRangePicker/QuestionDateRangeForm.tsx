import { Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import TextField from 'components/common/FormikUITextField';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

//This defines what the UI shows when adding this question parent template
export const QuestionDateForm = (props: QuestionFormProps) => {
  const field = props.question;

  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  return (
    <QuestionFormShell
      {...props}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
      })}
    >
      {() => {
        return (
          <>
            <Field
              name="naturalKey"
              label="Key"
              id="Key-Input"
              type="text"
              component={TextField}
              fullWidth
              inputProps={{ 'data-cy': 'natural_key' }}
            />
            <Field
              name="question"
              label="Question"
              id="Question-Input"
              type="text"
              component={TextField}
              fullWidth
              inputProps={{ 'data-cy': 'question' }}
            />

            <TitledContainer label="Constraints">
              <Field
                name="config.required"
                id="Is-Required-Input"
                component={CheckboxWithLabel}
                type="checkbox"
                Label={{
                  label: 'Is required',
                }}
                data-cy="required"
              />
            </TitledContainer>
          </>
        );
      }}
    </QuestionFormShell>
  );
};
