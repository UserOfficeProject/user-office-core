import React, { FunctionComponent } from "react";
import { Grid, Modal, Backdrop, Fade } from "@material-ui/core";
import {
  ProposalTemplateField,
  DataType,
  ProposalTemplate
} from "../model/ProposalModel";
import JSDict from "../utils/Dictionary";
import { IEvent } from "./QuestionaryEditorModel";
import { makeStyles } from "@material-ui/core/styles";
import { AdminComponentEmbellishment } from "./AdminComponentEmbellishment";
import { AdminComponentTextInput } from "./AdminComponentTextInput";
import { AdminComponentMultipleChoice } from "./AdminComponentMultipleChoice";
import { AdminComponentBoolean } from "./AdminComponentBoolean";
import { AdminComponentFileUpload } from "./AdminComponentFileUpload";

export default function QuestionaryFieldEditor(props: {
  field: ProposalTemplateField | null;
  dispatch: React.Dispatch<IEvent>;
  closeMe: Function;
  template: ProposalTemplate;
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
  componentMap.put(DataType.BOOLEAN, AdminComponentBoolean);
  componentMap.put(DataType.EMBELLISHMENT, AdminComponentEmbellishment);
  componentMap.put(DataType.FILE_UPLOAD, AdminComponentFileUpload);
  componentMap.put(
    DataType.SELECTION_FROM_OPTIONS,
    AdminComponentMultipleChoice
  );
  componentMap.put(DataType.TEXT_INPUT, AdminComponentTextInput);

  if (props.field === null) {
    return null;
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
            closeMe: props.closeMe,
            template: props.template
          })}
        </Grid>
      </Fade>
    </Modal>
  );
}

interface AdminComponentProps {
  field: ProposalTemplateField;
  template: ProposalTemplate;
  dispatch: React.Dispatch<IEvent>;
  closeMe: Function;
}

interface AdminComponentShellProps extends AdminComponentProps {
  label: string;
}
export interface AdminComponentSignature
  extends FunctionComponent<AdminComponentProps> {}

export interface AdminComponentShellSignature
  extends FunctionComponent<AdminComponentShellProps> {}
