import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useState } from 'react';

import PeopleTable from 'components/user/PeopleTable';
import { BasicUserDetails, Maybe, Role } from 'generated/sdk';
import { useFapMembersData } from 'hooks/fap/useFapMembersData';

export type FapAssignedMember = BasicUserDetails & { role?: Maybe<Role> };

type AssignFapMemberToProposalModalProps = {
  proposalPks: number[];
  setProposalPks: React.Dispatch<React.SetStateAction<number[]>>;
  fapId: number;
  assignMembersToFapProposals: (assignedMembers: FapAssignedMember[]) => void;
  assignedMembers?: Array<BasicUserDetails | null>;
};

const useStyles = makeStyles((theme) => ({
  selectedUsersText: {
    paddingRight: theme.spacing(1),
  },
}));

const memberRole = (member: FapAssignedMember) => `${member.role?.title}`;

const columns = [
  { title: 'Name', field: 'firstname' },
  { title: 'Surname', field: 'lastname' },
  {
    title: 'Role',
    render: (rowData: FapAssignedMember) => memberRole(rowData),
  },
  { title: 'Institution', field: 'institution' },
];

const AssignFapMemberToProposalModal = ({
  assignMembersToFapProposals: assignMembersToFapProposals,
  fapId,
  proposalPks,
  setProposalPks,
}: AssignFapMemberToProposalModalProps) => {
  const classes = useStyles();
  const [selectedParticipants, setSelectedParticipants] = useState<
    BasicUserDetails[]
  >([]);
  const { loadingMembers, FapMembersData } = useFapMembersData(fapId, false);

  useEffect(() => {
    if (proposalPks.length === 0) {
      setSelectedParticipants([]);
    }
  }, [proposalPks]);

  const members: FapAssignedMember[] = FapMembersData
    ? FapMembersData.map((fapMember) => ({
        ...fapMember.user,
        role: fapMember.role ?? null,
      }))
    : [];

  return (
    <Dialog
      maxWidth="sm"
      fullWidth
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={proposalPks.length > 0}
      onClose={(): void => setProposalPks([])}
    >
      <DialogContent>
        <PeopleTable
          title="Select reviewers"
          selection={true}
          data={members}
          isLoading={loadingMembers}
          columns={columns}
          onUpdate={(members: FapAssignedMember[]) =>
            assignMembersToFapProposals(members)
          }
          selectedParticipants={selectedParticipants}
          setSelectedParticipants={setSelectedParticipants}
        />
      </DialogContent>
      <DialogActions>
        <div className={classes.selectedUsersText}>
          {selectedParticipants.length} user(s) selected
        </div>
        <Button
          type="button"
          onClick={() => assignMembersToFapProposals(selectedParticipants)}
          disabled={selectedParticipants.length === 0}
          data-cy="assign-selected-users"
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignFapMemberToProposalModal;
