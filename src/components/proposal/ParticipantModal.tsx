import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { AddBox } from '@material-ui/icons';
import React from 'react';

import { UserRole } from '../../generated/sdk';
import PeopleTable from '../user/PeopleTable';

function ParticipantModal(props: {
  title: string;
  addParticipant: any;
  show: boolean;
  close: any;
  selectedUsers?: number[];
  userRole?: UserRole;
  invitationUserRole?: UserRole;
}) {
  const addUser = (rowData: any) => {
    props.addParticipant({
      firstname: rowData.firstname,
      lastname: rowData.lastname,
      organisation: rowData.organisation,
      id: rowData.id,
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
          title={props.title}
          actionText="Select user"
          actionIcon={<AddBox data-cy="select-user" />}
          action={addUser}
          selectedUsers={props.selectedUsers}
          userRole={props.userRole || ('' as UserRole)}
          emailInvite={true}
          invitationUserRole={props.invitationUserRole || props.userRole}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ParticipantModal;
