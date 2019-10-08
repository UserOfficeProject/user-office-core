import React from "react";
import { Typography, Button } from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";
import { EventType } from "./QuestionaryEditorModel";
import { AdminComponentSignature, CustomCheckbox, CustomTable } from "./QuestionaryFieldEditor";
import * as Yup from "yup";
import FormikDropdown from "./FormikDropdown";

export const AdminComponentMultipleChoice: AdminComponentSignature = props => {
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
            required: Yup.bool(),
            variant: Yup.string().required("Variant is required")
          })
        })}
      >
        {formikProps => (
          <Form style={{ flexGrow: 1 }}>
            <Typography>Select from options</Typography>

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
              label="Is required"
              checked={formikProps.values.config.required}
              component={CustomCheckbox}
              margin="normal"
              fullWidth
              data-cy="required"
            />

            <Field
              name="config.options"
              label="Options"
              component={CustomTable}
              columns={[{ title: "Answer", field: "answer" }]}
              value={formikProps.values.config.options!.map(option => {
                return { answer: option };
              })}
              onTableChange={(list: any[]) => {
                const options = list.map(row => {
                  return row.answer;
                });
                formikProps.setFieldValue("config.options", options);
              }}
              margin="normal"
              fullWidth
              data-cy="options"
            />

            <FormikDropdown
              name="config.variant"
              label="Variant"
              items={[{ text: "Radio", value: "radio" }, { text: "Dropdown", value: "dropdown" }]}
              data-cy="variant"
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
