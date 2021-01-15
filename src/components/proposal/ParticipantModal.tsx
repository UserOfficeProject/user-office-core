import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import AddBox from '@material-ui/icons/AddBox';
import React from 'react';

import PeopleTable from 'components/user/PeopleTable';
import { UserRole, BasicUserDetails } from 'generated/sdk';

function ParticipantModal(props: {
  title: string;
  addParticipants: (data: BasicUserDetails[]) => void;
  show: boolean;
  close: () => void;
  selection?: boolean;
  selectedUsers?: number[];
  userRole?: UserRole;
  invitationUserRole?: UserRole;
}) {
  const addUser = (rowData: BasicUserDetails) => {
    props.addParticipants([
      {
        firstname: rowData.firstname,
        lastname: rowData.lastname,
        organisation: rowData.organisation,
        id: rowData.id,
      } as BasicUserDetails,
    ]);
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
          action={{
            fn: addUser,
            actionText: 'Select user',
            actionIcon: <AddBox data-cy="select-user" />,
          }}
          selectedUsers={props.selectedUsers}
          userRole={props.userRole || ('' as UserRole)}
          emailInvite={true}
          selection={!!props.selection}
          onUpdate={data => props.addParticipants(data as BasicUserDetails[])}
          invitationUserRole={props.invitationUserRole || props.userRole}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ParticipantModal;
