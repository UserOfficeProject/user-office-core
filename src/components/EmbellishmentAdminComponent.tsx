import React from "react";
import { Typography, Button } from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";
import { EventType } from "./QuestionaryEditorModel";
import {
  AdminComponentSignature,
  CustomEditor
} from "./QuestionaryFieldEditor";
import * as Yup from "yup";

export const EmbellishmentAdminComponent: AdminComponentSignature = props => {
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
          <Form>
            <Typography>Embellishment</Typography>

            <Field
              name="config.html"
              value={formikProps.values.config.html}
              label="Content"
              type="text"
              component={CustomEditor}
              margin="normal"
              fullWidth
              data-cy="max"
              onEditorChange={(content: string) => {
                formikProps.setFieldValue("config.html", content);
              }}
            />

            <Field
              name="config.plain"
              label="Plan description"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="max"
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
