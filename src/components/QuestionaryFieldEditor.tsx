import React from "react";
import {
  Grid,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
  Modal,
  Backdrop,
  Fade
} from "@material-ui/core";
import {
  ProposalTemplateField,
  DataType} from "../model/ProposalModel";
import JSDict from "../utils/Dictionary";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField } from "formik-material-ui";
import { IAction, ActionType } from "./QuestionaryEditorModel";
import { makeStyles } from "@material-ui/core/styles";

export default function QuestionaryFieldEditor(props: {
  field: ProposalTemplateField | null;
  dispatch: React.Dispatch<IAction>;
  closeMe: Function;
}) {
  const classes = makeStyles(() => ({
    container: {
      backgroundColor: "white",
      padding: "20px",
      maxWidth: "700px"
    },
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
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
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.modal}
      open={props.field != null}
      onClose={() => {
        props.closeMe();
      }}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500
      }}
    >
      <Fade in={props.field != null}>
        <Grid container className={classes.container}>
          {componentMap.get(props.field.data_type)!({
            field: props.field,
            dispatch: props.dispatch,
            closeMe: props.closeMe
          })}
        </Grid>
      </Fade>
    </Modal>
  );
}

const TextFieldAdminComponent: AdminComponentSignature = props => {
  const field = props.field;

  return (
    <>
      <Formik
        initialValues={field}
        onSubmit={async vals => {
          props.dispatch({
            type: ActionType.UPDATE_ITEM,
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
        {props => (
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
              checked={props.values.config.required}
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
              checked={props.values.config.multiline}
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

type AdminComponentSignature = {
  (props: {
    field: ProposalTemplateField;
    dispatch: React.Dispatch<IAction>;
    closeMe: Function;
  }): JSX.Element;
};
// @ts-ignore
const CustomCheckbox = ({ field, checked, label }) => {
  return (
    <FormControlLabel
      control={<Checkbox {...field} checked={checked} color="primary" />}
      label={label}
    />
  );
}
