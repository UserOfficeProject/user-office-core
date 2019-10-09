import React from "react";
import { Typography, Button } from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";
import { EventType } from "./QuestionaryEditorModel";
import { AdminComponentSignature } from "./QuestionaryFieldEditor";
import * as Yup from "yup";
import { FormikUICustomSelect } from "./FormikUICustomSelect";

export const AdminComponentFileUpload: AdminComponentSignature = props => {
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
            file_type: Yup.array(),
            small_label: Yup.string(),
            max_files: Yup.number()
          })
        })}
      >
        {() => (
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
              name="config.small_label"
              label="Helper text"
              placeholder="(e.g. only PDF accepted)"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="small_label"
            />

            <Field
              name="config.file_type"
              label="Accepted file types (leave empty for any)"
              id="fileType"
              component={FormikUICustomSelect}
              availableOptions={[
                ".pdf",
                ".doc",
                ".docx",
                "audio/*",
                "video/*",
                "image/*"
              ]}
              margin="normal"
              fullWidth
              data-cy="file_type"
            />

            <Field
              name="config.max_files"
              label="Max number of files"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="max_files"
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
