import React from "react";
import { Grid, makeStyles, Typography, Button } from "@material-ui/core";
import { ProposalTemplateField, DataType } from "../model/ProposalModel";
import JSDict from "../utils/Dictionary";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField, Checkbox } from "formik-material-ui";

export default function QuestionaryFieldEditor(props: {
  field: ProposalTemplateField | null;
}) {
  const classes = makeStyles(() => ({
    container: {
      backgroundColor: "white",
      padding: "20px",
      maxWidth: "900px"
    }
  }))();

  const componentMap = JSDict.Create<DataType, AdminComponentSignature>();
  componentMap.put(DataType.TEXT_INPUT, TextFieldAdminComponent);

  if (props.field === null) {
    return <span>Prepearing...</span>;
  }
  if (componentMap.get(props.field.data_type) === null) {
    return <span>Error ocurred</span>;
  }
  return (
    <Grid container className={classes.container}>
      {componentMap.get(props.field.data_type)!({ field: props.field })}
    </Grid>
  );
}

function TextFieldAdminComponent(props: { field: ProposalTemplateField }) {
  const field = props.field;

  return (
    <>
      <Formik
        initialValues={{
          question: field.question,
          min: field.config.min,
          max: field.config.max,
          required: field.config.required
        }}
        onSubmit={async () => {}}
        validationSchema={Yup.object().shape({
          question: Yup.string().required("Question is required"),
          min: Yup.number(),
          max: Yup.number(),
          required: Yup.bool()
        })}
      >
        {() => (
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
              name="min"
              label="Min"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="min"
            />

            <Field
              name="max"
              label="Max"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="max"
            />

            <Field
              name="required"
              label="Is required"
              type="checkbox"
              component={Checkbox}
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
}

type AdminComponentSignature = {
  (props: { field: ProposalTemplateField }): JSX.Element;
};
