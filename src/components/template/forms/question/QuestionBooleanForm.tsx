import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';

import { Question } from '../../../../generated/sdk';
import { useNaturalKeySchema } from '../../../../utils/userFieldValidationSchema';
import FormikUICustomCheckbox from '../../../common/FormikUICustomCheckbox';
import TitledContainer from '../../../common/TitledContainer';
import { TFormSignature } from '../TFormSignature';
import { QuestionFormShell } from './QuestionFormShell';

export const QuestionBooleanForm: TFormSignature<Question> = props => {
  const field = props.field;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  return (
    <QuestionFormShell
      label="Boolean"
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      question={props.field}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          required: Yup.bool(),
        }),
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

          <TitledContainer label="Constraints">
            <Field
              name="config.required"
              checked={formikProps.values.config.required}
              component={FormikUICustomCheckbox}
              label="User must check it to continue"
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
