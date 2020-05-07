import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';
import { TextInputConfig } from '../../../../generated/sdk';
import { EventType } from '../../../../models/QuestionaryEditorModel';
import { useNaturalKeySchema } from '../../../../utils/userFieldValidationSchema';
import { QuestionFormShell } from './QuestionFormShell';
import { TextInputConfigFragment } from '../fragments/TextInputConfigFragment';
import { AdminComponentSignature } from '../QuestionRelEditor';

export const QuestionTextInputForm: AdminComponentSignature = props => {
  const field = props.field;
  const naturalKeySchema = useNaturalKeySchema(field.question.naturalKey);

  return (
    <Formik
      initialValues={field}
      onSubmit={async vals => {
        props.dispatch({
          type: EventType.UPDATE_FIELD_REQUESTED,
          payload: {
            field: {
              ...field,
              ...vals,
              config: {
                ...vals.question.config,
                htmlQuestion: (vals.question.config as TextInputConfig)
                  .isHtmlQuestion
                  ? (vals.question.config as TextInputConfig).htmlQuestion
                  : null,
              },
            },
          },
        });
        props.closeMe();
      }}
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
        <Form style={{ flexGrow: 1 }}>
          <QuestionFormShell {...props} label="Text input">
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
              config={formikProps.values.question.config as TextInputConfig}
            />
          </QuestionFormShell>
        </Form>
      )}
    </Formik>
  );
};
