import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import AddBox from '@material-ui/icons/AddBox';
import React from 'react';

import { useCheckAccess } from 'components/common/Can';
import PeopleTable from 'components/user/PeopleTable';
import ProposalPeopleTable from 'components/user/ProposalsPeopleTable';
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
  participant?: boolean;
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

  const someProps = {
    title: props.title,
    action: {
      fn: addUser,
      actionText: 'Select user',
      actionIcon: <AddBox data-cy="select-user" />,
    },
    selectedUsers: props.selectedUsers,
    userRole: props.userRole || ('' as UserRole),
    emailInvite: true,
    selection: !!props.selection,
    onUpdate: (data: BasicUserDetails[]) => props.addParticipants(data),
    invitationUserRole: props.invitationUserRole || props.userRole,
  };

  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const peopleTable = <PeopleTable {...someProps} />;

  const prosalPeopleTable = <ProposalPeopleTable {...someProps} />;

  return (
    <Dialog
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={props.show}
      onClose={() => props.close()}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent>
        {props.participant && !isUserOfficer ? prosalPeopleTable : peopleTable}
      </DialogContent>
    </Dialog>
  );
}

export default ParticipantModal;
