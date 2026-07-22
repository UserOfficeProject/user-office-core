import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import React, { useEffect, useState } from 'react';

import PeopleTable from 'components/user/PeopleTable';
import { BasicUserDetails, Maybe, Role } from 'generated/sdk';
import { useFapMembersData } from 'hooks/fap/useFapMembersData';
import { getPreferredName } from 'utils/user';

import { MultiRankAssignmentDialog } from '../MultiRankAssignmentDialog';

export type FapAssignedMember = BasicUserDetails & {
  role?: Maybe<Pick<Role, 'id' | 'shortCode' | 'title'>>;
  rank?: number | null;
};

type AssignFapMemberToProposalModalProps = {
  proposals: { proposalPk: number; proposalId: string }[];
  setProposals: React.Dispatch<
    React.SetStateAction<{ proposalPk: number; proposalId: string }[]>
  >;
  fapId: number;
  assignMembersToFapProposals: (
    assignedMembers: FapAssignedMember[],
    proposalPks: number[]
  ) => void;
  assignedMembers?: Array<BasicUserDetails | null>;
};

const memberRole = (member: FapAssignedMember) => `${member.role?.title}`;

const columns = [
  {
    title: 'Name',
    render: (rowData: FapAssignedMember) => getPreferredName(rowData),
  },
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
  proposals,
  setProposals,
}: AssignFapMemberToProposalModalProps) => {
  const [selectedParticipants, setSelectedParticipants] = useState<
    BasicUserDetails[]
  >([]);
  const { loadingMembers, FapMembersData } = useFapMembersData(fapId, false);
  const [rankSelectorOpen, setRankSelectorOpen] = useState(false);

  useEffect(() => {
    if (proposals.length === 0) {
      setSelectedParticipants([]);
    }
  }, [proposals]);

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
      open={proposals.length > 0}
      onClose={(): void => setProposals([])}
    >
      <DialogContent>
        <PeopleTable
          title={`Select reviewers for proposals: ${proposals.map((pk) => pk.proposalId).join(', ')}`}
          selection={true}
          data={members}
          emailSearch={false}
          isLoading={loadingMembers}
          columns={columns}
          search
          customSearch={false}
          onUpdate={(members: FapAssignedMember[]) =>
            assignMembersToFapProposals(
              members,
              proposals.map((p) => p.proposalPk)
            )
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
          onClick={() =>
            assignMembersToFapProposals(
              selectedParticipants,
              proposals.map((p) => p.proposalPk)
            )
          }
          disabled={selectedParticipants.length === 0}
          data-cy="assign-selected-users"
        >
          Assign without Rankings
        </Button>
        <Button
          type="button"
          onClick={() => {
            setRankSelectorOpen(true);
          }}
          disabled={selectedParticipants.length === 0}
          color="primary"
          data-cy="assign-selected-users-with-rank"
        >
          Assign with Rankings
        </Button>
        {rankSelectorOpen && (
          <MultiRankAssignmentDialog
            users={selectedParticipants ? selectedParticipants : []}
            open={rankSelectorOpen}
            setOpen={setRankSelectorOpen}
            assign={(users) =>
              assignMembersToFapProposals(
                users,
                proposals.map((p) => p.proposalPk)
              )
            }
          />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AssignFapMemberToProposalModal;
