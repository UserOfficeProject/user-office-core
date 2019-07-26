import React from "react";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import RoleTable from "./RoleTable";

function RoleModal(props) {
  return (
    <Dialog
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={props.show}
      onClose={() => props.close()}
    >
      <DialogContent>
        <RoleTable add={props.add} />
      </DialogContent>
    </Dialog>
  );
}

export default RoleModal;
