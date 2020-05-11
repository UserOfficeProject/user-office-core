import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';
import { Question, TextInputConfig } from '../../../../generated/sdk';
import { useNaturalKeySchema } from '../../../../utils/userFieldValidationSchema';
import { TextInputConfigFragment } from '../fragments/TextInputConfigFragment';
import { TFormSignature } from '../TFormSignature';
import { QuestionFormShell } from './QuestionFormShell';

export const QuestionTextInputForm: TFormSignature<Question> = props => {
  const field = props.field;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  return (
    <QuestionFormShell
      label="Text input"
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      field={props.field}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          naturalKey: naturalKeySchema,
          question: Yup.string().required('Question is required'),
          config: Yup.object({
            min: Yup.number().nullable(),
            max: Yup.number().nullable(),
            required: Yup.boolean(),
            placeholder: Yup.string(),
            multiline: Yup.boolean(),
            isHtmlQuestion: Yup.boolean(),
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
          <TextInputConfigFragment
            config={formikProps.values.config as TextInputConfig}
          />
        </>
      )}
    </QuestionFormShell>
  );
};
