import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import React, { useEffect, useState } from 'react';

import PeopleTable from 'components/user/PeopleTable';
import { BasicUserDetails, Maybe, Role } from 'generated/sdk';
import { useFapMembersData } from 'hooks/fap/useFapMembersData';

import { MultiRankAssignmentDialog } from './MultiRankAssignmentDialog';

export type FapAssignedMember = BasicUserDetails & {
  role?: Maybe<Pick<Role, 'id' | 'shortCode' | 'title'>>;
  rank?: number | null;
};

type AssignFapMemberToProposalModalProps = {
  proposalPks: number[];
  setProposalPks: React.Dispatch<React.SetStateAction<number[]>>;
  fapId: number;
  assignMembersToFapProposals: (assignedMembers: FapAssignedMember[]) => void;
  assignedMembers?: Array<BasicUserDetails | null>;
};

const memberRole = (member: FapAssignedMember) => `${member.role?.title}`;

const columns = [
  { title: 'Name', field: 'firstname' },
  { title: 'Surname', field: 'lastname' },
  { title: 'Proposal Count', field: 'proposalsCountByCall' },
  {
    title: 'Role',
    render: (rowData: FapAssignedMember) => memberRole(rowData),
  },
  { title: 'Institution', field: 'institution' },
];

const AssignFapMemberToProposalModal = ({
  assignMembersToFapProposals,
  fapId,
  proposalPks,
  setProposalPks,
}: AssignFapMemberToProposalModalProps) => {
  const [selectedParticipants, setSelectedParticipants] = useState<
    BasicUserDetails[]
  >([]);
  const { loadingMembers, FapMembersData } = useFapMembersData(fapId, false);
  const [rankSelectorOpen, setRankSelectorOpen] = useState(false);

  useEffect(() => {
    if (proposalPks.length === 0) {
      setSelectedParticipants([]);
    }
  }, [proposalPks]);

  const members: FapAssignedMember[] = FapMembersData
    ? FapMembersData.map((fapMember) => ({
        ...fapMember.user,
        role: fapMember.role ?? null,
        proposalsCountByCall: fapMember.proposalsCountByCall,
      }))
    : [];

  return (
    <Dialog
      maxWidth="md"
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
          emailSearch={false}
          isLoading={loadingMembers}
          columns={columns}
          search
          onUpdate={(members: FapAssignedMember[]) =>
            assignMembersToFapProposals(members)
          }
          selectedParticipants={selectedParticipants}
          setSelectedParticipants={setSelectedParticipants}
        />
      </DialogContent>
      <DialogActions>
        <Box
          sx={(theme) => ({
            paddingRight: theme.spacing(1),
          })}
        >
          {selectedParticipants.length} user(s) selected
        </Box>
        <Button
          type="button"
          onClick={() => assignMembersToFapProposals(selectedParticipants)}
          disabled={selectedParticipants.length === 0}
          data-cy="assign-selected-users"
        >
          Update without rank
        </Button>
        <Button
          type="button"
          onClick={() => {
            setRankSelectorOpen(true);
          }}
          color="primary"
          data-cy="assign-selected-users-with-rank"
        >
          Assign Ranks
        </Button>
        {rankSelectorOpen && (
          <MultiRankAssignmentDialog
            users={selectedParticipants ? selectedParticipants : []}
            open={rankSelectorOpen}
            setOpen={setRankSelectorOpen}
            assign={assignMembersToFapProposals}
          />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AssignFapMemberToProposalModal;
