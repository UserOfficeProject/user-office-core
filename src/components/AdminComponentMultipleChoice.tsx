import React from "react";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";
import { EventType } from "../model/QuestionaryEditorModel";
import { AdminComponentSignature } from "./QuestionaryFieldEditor";
import FormikUICustomCheckbox from "./FormikUICustomCheckbox";
import FormikUICustomTable from "./FormikUICustomTable";
import * as Yup from "yup";
import FormikDropdown from "./FormikDropdown";
import { AdminComponentShell } from "./AdminComponentShell";
import FormikUICustomDependencySelector from "./FormikUICustomDependencySelector";
import TitledContainer from "./TitledContainer";

export const AdminComponentMultipleChoice: AdminComponentSignature = props => {
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
        question: Yup.string().required("Question is required"),
        config: Yup.object({
          required: Yup.bool(),
          variant: Yup.string().required("Variant is required")
        })
      })}
    >
      {formikProps => (
        <Form style={{ flexGrow: 1 }}>
          <AdminComponentShell {...props} label="Multiple choice">
            <Field
              name="question"
              label="Question"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="question"
            />

            <TitledContainer label="Constraints">
              <Field
                name="config.required"
                label="Is required"
                checked={formikProps.values.config.required}
                component={FormikUICustomCheckbox}
                margin="normal"
                fullWidth
                data-cy="required"
              />
            </TitledContainer>

            <TitledContainer label="Options">
              <FormikDropdown
                name="config.variant"
                label="Variant"
                items={[
                  { text: "Radio", value: "radio" },
                  { text: "Dropdown", value: "dropdown" }
                ]}
                data-cy="variant"
              />
            </TitledContainer>

            <TitledContainer label="Items">
              <Field
                title=""
                name="config.options"
                component={FormikUICustomTable}
                columns={[{ title: "Answer", field: "answer" }]}
                dataTransforms={{
                  toTable: (options: string[]) => {
                    return options.map(option => {
                      return { answer: option };
                    });
                  },
                  fromTable: (rows: any[]) => {
                    return rows.map(row => row.answer);
                  }
                }}
                margin="normal"
                fullWidth
                data-cy="options"
              />
            </TitledContainer>
            <TitledContainer label="Dependencies">
              <Field
                name="dependencies"
                component={FormikUICustomDependencySelector}
                templateField={props.field}
                template={props.template}
                label="User must check it to continue"
                margin="normal"
                fullWidth
                data-cy="dependencies"
              />
            </TitledContainer>
          </AdminComponentShell>
        </Form>
      )}
    </Formik>
  );
};
