import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';
import {
  Question,
  SelectionFromOptionsConfig,
} from '../../../../generated/sdk';
import { useNaturalKeySchema } from '../../../../utils/userFieldValidationSchema';
import { MultipleChoiceConfigFragment } from '../fragments/MultipleChoiceConfigFragment';
import { TFormSignature } from '../TFormSignature';
import { QuestionFormShell } from './QuestionFormShell';

export const QuestionMultipleChoiceForm: TFormSignature<Question> = props => {
  const field = props.field;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  return (
    <QuestionFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      field={props.field}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          naturalKey: naturalKeySchema,
          question: Yup.string().required('Question is required'),
          config: Yup.object({
            required: Yup.bool(),
            variant: Yup.string().required('Variant is required'),
          }),
        }),
      })}
    >
      {formikProps => (
        <>
          <Field
            name="question.naturalKey"
            label="Key"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />
          <Field
            name="question.question"
            label="Question"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <MultipleChoiceConfigFragment
            config={formikProps.values.config as SelectionFromOptionsConfig}
          />
        </>
      )}
    </QuestionFormShell>
  );
};
