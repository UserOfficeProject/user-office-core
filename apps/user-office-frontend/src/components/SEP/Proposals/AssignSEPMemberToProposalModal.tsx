import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useState } from 'react';

import PeopleTable from 'components/user/PeopleTable';
import { BasicUserDetails, Maybe, Role } from 'generated/sdk';
import { useSEPMembersData } from 'hooks/SEP/useSEPMembersData';

export type SepAssignedMember = BasicUserDetails & { role?: Maybe<Role> };

type AssignSEPMemberToProposalModalProps = {
  proposalPk: number | null;
  setProposalPk: React.Dispatch<React.SetStateAction<number | null>>;
  sepId: number;
  assignMemberToSEPProposal: (assignedMembers: SepAssignedMember[]) => void;
  assignedMembers?: Array<BasicUserDetails | null>;
};

const useStyles = makeStyles((theme) => ({
  selectedUsersText: {
    paddingRight: theme.spacing(1),
  },
}));

const memberRole = (member: SepAssignedMember) => `${member.role?.title}`;

const columns = [
  { title: 'Name', field: 'firstname' },
  { title: 'Surname', field: 'lastname' },
  {
    title: 'Role',
    render: (rowData: SepAssignedMember) => memberRole(rowData),
  },
  { title: 'Organisation', field: 'organisation' },
];

const AssignSEPMemberToProposalModal = ({
  assignMemberToSEPProposal,
  sepId,
  assignedMembers,
  proposalPk,
  setProposalPk,
}: AssignSEPMemberToProposalModalProps) => {
  const classes = useStyles();
  const [selectedParticipants, setSelectedParticipants] = useState<
    BasicUserDetails[]
  >([]);
  const { loadingMembers, SEPMembersData } = useSEPMembersData(sepId, false);

  useEffect(() => {
    if (!proposalPk) {
      setSelectedParticipants([]);
    }
  }, [proposalPk]);

  const members: SepAssignedMember[] = SEPMembersData
    ? SEPMembersData.filter(
        (sepMember) =>
          !assignedMembers?.find(
            (assignedMember) => assignedMember?.id === sepMember.userId
          )
      ).map((sepMember) => ({
        ...sepMember.user,
        role: sepMember.role ?? null,
      }))
    : [];

  return (
    <Dialog
      maxWidth="sm"
      fullWidth
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={!!proposalPk}
      onClose={(): void => setProposalPk(null)}
    >
      <DialogContent>
        <PeopleTable
          title="Select reviewers"
          selection={true}
          data={members}
          isLoading={loadingMembers}
          columns={columns}
          onUpdate={(members: SepAssignedMember[]) =>
            assignMemberToSEPProposal(members)
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
          onClick={() => assignMemberToSEPProposal(selectedParticipants)}
          disabled={selectedParticipants.length === 0}
          data-cy="assign-selected-users"
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignSEPMemberToProposalModal;
