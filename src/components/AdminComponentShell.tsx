import React from "react";
import { Button, Typography } from "@material-ui/core";
import { EventType } from "./QuestionaryEditorModel";
import { AdminComponentShellSignature } from "./QuestionaryFieldEditor";

export const AdminComponentShell: AdminComponentShellSignature = props => {
  return (
    <div>
      <Typography>{props.label}</Typography>
      {props.children}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          type="button"
          variant="contained"
          color="primary"
          data-cy="delete"
          onClick={() => {
            props.dispatch({
              type: EventType.DELETE_FIELD_REQUESTED,
              payload: { fieldId: props.field.proposal_question_id }
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
    </div>
  );
};
