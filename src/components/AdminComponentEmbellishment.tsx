import React from "react";
import { Typography, Button } from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";
import { EventType } from "./QuestionaryEditorModel";
import { AdminComponentSignature } from "./QuestionaryFieldEditor";
import { FormikUICustomEditor } from "./FormikUICustomEditor";
import * as Yup from "yup";

export const AdminComponentEmbellishment: AdminComponentSignature = props => {
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
          config: Yup.object({
            html: Yup.string().required("Content is required"),
            plain: Yup.string().required("Plain description is required")
          })
        })}
      >
        {formikProps => (
          <Form style={{ flexGrow: 1 }}>
            <Typography>Embellishment</Typography>

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

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                type="button"
                variant="contained"
                color="primary"
                data-cy="delete"
                onClick={() => {
                  props.dispatch({
                    type: EventType.DELETE_FIELD_REQUESTED,
                    payload: { fieldId: field.proposal_question_id }
                  });
                  props.closeMe();
                }}
              >
                Delete
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                data-cy="submit"
              >
                Save
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};
