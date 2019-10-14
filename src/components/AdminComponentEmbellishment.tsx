import React from "react";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";
import { EventType } from "./QuestionaryEditorModel";
import { AdminComponentSignature } from "./QuestionaryFieldEditor";
import FormikUICustomEditor from "./FormikUICustomEditor";
import * as Yup from "yup";
import { AdminComponentShell } from "./AdminComponentShell";
import FormikUICustomDependencySelector from "./FormikUICustomDependencySelector";
import TitledContainer from "./TitledContainer";

export const AdminComponentEmbellishment: AdminComponentSignature = props => {
  const field = props.field;
  return (
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
        config: Yup.object({
          html: Yup.string().required("Content is required"),
          plain: Yup.string().required("Plain description is required")
        })
      })}
    >
      {formikProps => (
        <Form style={{ flexGrow: 1 }}>
          <AdminComponentShell {...props} label="Embellishment">
            <Field
              name="config.html"
              type="text"
              component={FormikUICustomEditor}
              margin="normal"
              fullWidth
              init={{
                skin: false,
                content_css: false,
                plugins: ["link", "preview", "image", "code"],
                toolbar: "bold italic",
                branding: false
              }}
              data-cy="html"
            />

            <Field
              name="config.plain"
              label="Plain description"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="max"
            />
            <TitledContainer label="Dependencies">
              <Field
                name="dependencies"
                component={FormikUICustomDependencySelector}
                templateField={props.field}
                template={props.template}
                label="User must check it to continue"
                margin="normal"
                fullWidth
                data-cy="required"
              />
            </TitledContainer>
          </AdminComponentShell>
        </Form>
      )}
    </Formik>
  );
};
