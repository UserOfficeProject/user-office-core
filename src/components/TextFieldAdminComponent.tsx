import React from "react";
import { Typography, Button } from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";
import { EventType } from "./QuestionaryEditorModel";
import {
  AdminComponentSignature,
  CustomCheckbox
} from "./QuestionaryFieldEditor";
import * as Yup from "yup";

export const TextFieldAdminComponent: AdminComponentSignature = props => {
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
            min: Yup.number(),
            max: Yup.number(),
            required: Yup.bool(),
            placeholder: Yup.string(),
            multiline: Yup.boolean()
          })
        })}
      >
        {formikProps => (
          <Form>
            <Typography>Text input</Typography>

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
              label="Is required"
              margin="normal"
              fullWidth
              data-cy="required"
            />

            <Field
              name="config.min"
              label="Min"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="min"
            />

            <Field
              name="config.max"
              label="Max"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="max"
            />

            <Field
              name="config.placeholder"
              label="Placeholder text"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="max"
            />

            <Field
              name="config.multiline"
              checked={formikProps.values.config.multiline}
              component={CustomCheckbox}
              label="Multiple line"
              margin="normal"
              fullWidth
              data-cy="multiline"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              data-cy="submit"
            >
              Save
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};
