import React from "react";
import { Grid, FormControlLabel, Checkbox, Modal, Backdrop, Fade } from "@material-ui/core";
import { ProposalTemplateField, DataType } from "../model/ProposalModel";
import JSDict from "../utils/Dictionary";
import { IEvent } from "./QuestionaryEditorModel";
import { makeStyles } from "@material-ui/core/styles";
import { Editor } from "@tinymce/tinymce-react";
import { AdminComponentEmbellishment } from "./AdminComponentEmbellishment";
import { AdminComponentTextInput } from "./AdminComponentTextInput";
import { AdminComponentMultipleChoice } from "./AdminComponentMultipleChoice";
import MaterialTable from "material-table";
import { AdminComponentBoolean } from "./AdminComponentBoolean";
import { AdminComponentFileUpload } from "./AdminComponentFileUpload";

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
  componentMap.put(DataType.TEXT_INPUT, AdminComponentTextInput);
  componentMap.put(DataType.EMBELLISHMENT, AdminComponentEmbellishment);
  componentMap.put(DataType.SELECTION_FROM_OPTIONS, AdminComponentMultipleChoice);
  componentMap.put(DataType.BOOLEAN, AdminComponentBoolean);
  componentMap.put(DataType.FILE_UPLOAD, AdminComponentFileUpload);

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
            closeMe: props.closeMe
          })}
        </Grid>
      </Fade>
    </Modal>
  );
}

export type AdminComponentSignature = {
  (props: { field: ProposalTemplateField; dispatch: React.Dispatch<IEvent>; closeMe: Function }): JSX.Element;
};

export const CustomCheckbox = ({ field, checked, label }: { field: any; checked: boolean; label: string }) => {
  return <FormControlLabel control={<Checkbox {...field} checked={checked} color="primary" />} label={label} />;
};

export const CustomEditor = ({
  initialValue,
  onEditorChange
}: {
  initialValue: string;
  onEditorChange: (content: string) => void;
}) => {
  return (
    <Editor
      initialValue={initialValue}
      init={{
        skin: false,
        content_css: false,
        plugins: ["link", "preview", "image", "code"],
        toolbar: "bold italic",
        branding: false
      }}
      onEditorChange={content => onEditorChange(content)}
    />
  );
};

export const CustomTable = ({
  columns,
  value,
  onTableChange
}: {
  columns: { title: string; field: string }[];
  value: any[];
  onTableChange: (list: Array<any>) => void;
}) => {
  const [state, setState] = React.useState(value);

  return (
    <MaterialTable
      title={""}
      // @ts-ignore
      columns={columns}
      data={state}
      editable={{
        onRowAdd: newData =>
          new Promise(resolve => {
            const data = [...state];
            data.push(newData);
            setState(data);
            onTableChange(value);
            resolve();
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise(resolve => {
            const data = [...state];
            data[data.indexOf(oldData!)] = newData;
            setState(data);
            onTableChange(data);
            resolve();
          }),
        onRowDelete: oldData =>
          new Promise(resolve => {
            const data = [...state];
            data.splice(data.indexOf(oldData), 1);
            setState(data);
            onTableChange(data);
            resolve();
          })
      }}
    />
  );
};
