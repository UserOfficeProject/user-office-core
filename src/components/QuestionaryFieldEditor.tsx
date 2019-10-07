import React from "react";
import {
  Grid,
  FormControlLabel,
  Checkbox,
  Modal,
  Backdrop,
  Fade
} from "@material-ui/core";
import { ProposalTemplateField, DataType } from "../model/ProposalModel";
import JSDict from "../utils/Dictionary";
import { IEvent } from "./QuestionaryEditorModel";
import { makeStyles } from "@material-ui/core/styles";
import { Editor } from "@tinymce/tinymce-react";
import { EmbellishmentAdminComponent } from "./EmbellishmentAdminComponent";
import { TextFieldAdminComponent } from "./TextFieldAdminComponent";

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

export type AdminComponentSignature = {
  (props: {
    field: ProposalTemplateField;
    dispatch: React.Dispatch<IEvent>;
    closeMe: Function;
  }): JSX.Element;
};

export const CustomCheckbox = ({
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

export const CustomEditor = ({
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
