import React from 'react';
import { Typography, Button } from '@material-ui/core';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { EventType } from './QuestionaryEditorModel';
import { AdminComponentSignature, CustomCheckbox } from './QuestionaryFieldEditor';
import * as Yup from 'yup';

export const AdminComponentBoolean: AdminComponentSignature = props => {
  const field = props.field;
  return (
    <>
      <Formik
        initialValues={field}
        onSubmit={async vals => {
          props.dispatch({
            type: EventType.UPDATE_FIELD_REQUESTED,
            payload: {
              field: { ...field, ...vals }
            }
          });
          props.closeMe();
        }}
        validationSchema={Yup.object().shape({
          question: Yup.string().required("Question is required"),
          config: Yup.object({
            required: Yup.bool()
          })
        })}
      >
        {formikProps => (
          <Form style={{ flexGrow: 1 }}>
            <Typography>Checkbox</Typography>

            <Field
              name="question"
              label="Question"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="question"
            />

            <Field
              name="config.required"
              checked={formikProps.values.config.required}
              component={CustomCheckbox}
              label="User must check it to continue"
              margin="normal"
              fullWidth
              data-cy="required"
            />

            <Button type="submit" fullWidth variant="contained" color="primary" data-cy="submit">
              Save
            </Button>

          </Form>
        )}
      </Formik>
    </>
  );
};
