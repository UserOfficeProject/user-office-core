import React from "react";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";
import { EventType } from "./QuestionaryEditorModel";
import { AdminComponentSignature } from "./QuestionaryFieldEditor";
import FormikUICustomCheckbox from "./FormikUICustomCheckbox";
import * as Yup from "yup";
import { AdminComponentShell } from "./AdminComponentShell";
import FormikUICustomDependencySelector from "./FormikUICustomDependencySelector";

export const AdminComponentTextInput: AdminComponentSignature = props => {
  const field = props.field;
  return (
    <AdminComponentShell {...props} label="Text input">
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
          <Form style={{ flexGrow: 1 }}>
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
              component={FormikUICustomCheckbox}
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
              component={FormikUICustomCheckbox}
              label="Multiple line"
              margin="normal"
              fullWidth
              data-cy="multiline"
            />
            <Field
              name="dependencies"
              component={FormikUICustomDependencySelector}
              question={props.field}
              template={props.template}
              label="User must check it to continue"
              margin="normal"
              fullWidth
              data-cy="required"
            />
          </Form>
        )}
      </Formik>
    </AdminComponentShell>
  );
};
