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
import { ProposalTemplateField, DataType } from "../model/ProposalModel";
import JSDict from "../utils/Dictionary";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField } from "formik-material-ui";
import { IEvent, EventType } from "./QuestionaryEditorModel";
import { makeStyles } from "@material-ui/core/styles";
import { Editor } from "@tinymce/tinymce-react";

export default function QuestionaryFieldEditor(props: {
  field: ProposalTemplateField | null;
  dispatch: React.Dispatch<IEvent>;
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
  componentMap.put(DataType.EMBELLISHMENT, EmbellishmentAdminComponent);

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
              checked={formikProps.values.config.required}
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
              checked={formikProps.values.config.multiline}
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

const EmbellishmentAdminComponent: AdminComponentSignature = props => {
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

type AdminComponentSignature = {
  (props: {
    field: ProposalTemplateField;
    dispatch: React.Dispatch<IEvent>;
    closeMe: Function;
  }): JSX.Element;
};

const CustomCheckbox = ({
  field,
  checked,
  label
}: {
  field: any;
  checked: boolean;
  label: string;
}) => {
  return (
    <FormControlLabel
      control={<Checkbox {...field} checked={checked} color="primary" />}
      label={label}
    />
  );
};

const CustomEditor = ({
  field,
  value,
  label,
  onEditorChange
}: {
  field: any;
  value: string;
  label: string;
  onEditorChange: (content: string) => void;
}) => {
  return (
    <FormControlLabel
      control={
        <Editor
          initialValue={value}
          init={{
            skin: false,
            content_css: false,
            plugins: ["link", "preview", "image", "code"],
            toolbar: "bold italic",
            branding: false
          }}
          onEditorChange={content => onEditorChange(content)}
          {...field}
        />
      }
      label={label}
    />
  );
};
