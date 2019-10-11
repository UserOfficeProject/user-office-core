import React from "react";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";
import { EventType } from "./QuestionaryEditorModel";
import { AdminComponentSignature } from "./QuestionaryFieldEditor";
import FormikUICustomCheckbox from "./FormikUICustomCheckbox";
import FormikUICustomDependencySelector from "./FormikUICustomDependencySelector";
import * as Yup from "yup";
import { AdminComponentShell } from "./AdminComponentShell";

export const AdminComponentBoolean: AdminComponentSignature = props => {
  const field = props.field;

  return (
    <AdminComponentShell {...props} label="Checkbox">
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
              label="User must check it to continue"
              margin="normal"
              fullWidth
              data-cy="required"
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
