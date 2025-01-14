import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import React, { useEffect, useState } from 'react';

import PeopleTable from 'components/user/PeopleTable';
import { BasicUserDetails, Maybe, Role } from 'generated/sdk';
import { useFapMembersData } from 'hooks/fap/useFapMembersData';
import { FapProposalType } from 'hooks/fap/useFapProposalsData';

export type FapAssignedMember = BasicUserDetails & { role?: Maybe<Role> };

type AssignFapMemberToProposalModalProps = {
  proposalPks: number[];
  setProposalPks: React.Dispatch<React.SetStateAction<number[]>>;
  selectedFapProposals: FapProposalType[];
  setSelectedFapProposal: React.Dispatch<
    React.SetStateAction<FapProposalType[]>
  >;
  fapId: number;
  assignMembersToFapProposals: (
    assignedMembers: FapAssignedMember[],
    selectedProposals: FapProposalType[]
  ) => void;
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
  selectedFapProposals,
  setSelectedFapProposal,
}: AssignFapMemberToProposalModalProps) => {
  const [selectedParticipants, setSelectedParticipants] = useState<
    BasicUserDetails[]
  >([]);
  const { loadingMembers, FapMembersData } = useFapMembersData(fapId, false);

  useEffect(() => {
    if (selectedFapProposals.length === 0) {
      setSelectedParticipants([]);
    }
  }, [selectedFapProposals]);

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
      open={selectedFapProposals.length > 0}
      onClose={(): void => setSelectedFapProposal([])}
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
            assignMembersToFapProposals(members, selectedFapProposals)
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
              selectedFapProposals
            )
          }
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
