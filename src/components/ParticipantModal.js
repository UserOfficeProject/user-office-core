import React from "react";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import PeopleTable from "./PeopleTable";
import { AddBox } from "@material-ui/icons";

function ParticipantModal(props) {
  const addUser = rowData => {
    props.addParticipant({
      firstname: rowData.firstname,
      lastname: rowData.lastname,
      username: rowData.username,
      organisation: rowData.organisation,
      id: rowData.id
    });
  };
  return (
    <Dialog
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={props.show}
      onClose={() => props.close()}
    >
      <DialogContent>
        <PeopleTable
          title="Add Participants"
          actionText="Select user"
          actionIcon={<AddBox />}
          action={addUser}
          selectedUsers={props.selectedUsers}
          usersOnly={true}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ParticipantModal;
