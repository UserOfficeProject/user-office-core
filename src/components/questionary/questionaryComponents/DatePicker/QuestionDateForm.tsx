import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';

import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import TitledContainer from 'components/common/TitledContainer';
import { FormComponent } from 'components/questionary/QuestionaryComponentRegistry';
import { DateConfig, Question } from 'generated/sdk';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

export const QuestionDateForm: FormComponent<Question> = props => {
  const field = props.field;
  const config = field.config as DateConfig;

  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  return (
    <QuestionFormShell
      label="Date"
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      question={props.field}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
      })}
    >
      {formikProps => (
        <>
          <Field
            name="naturalKey"
            label="Key"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />
          <Field
            name="question"
            label="Question"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />
          <Field
            name="config.tooltip"
            label="Tooltip"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'tooltip' }}
          />
          <TitledContainer label="Constraints">
            <Field
              name="config.required"
              label="Is required"
              checked={config.required}
              component={FormikUICustomCheckbox}
              margin="normal"
              fullWidth
              data-cy="required"
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
