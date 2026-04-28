import MaterialTable from '@material-table/core';
import { Dialog, DialogActions, DialogContent } from '@mui/material';
import Button from '@mui/material/Button';
import React from 'react';

import { FapProposalType } from 'hooks/fap/useFapProposalsData';

import { MultiRankAssignmentDialog } from '../MultiRankAssignmentDialog';
import { FapAssignedMember } from '../ProposalsView/AssignFapMemberToProposalModal';

const columns = [
  { title: 'Proposal ID', field: 'proposalId' },
  { title: 'Proposal title', field: 'title' },
  { title: 'Instrument', field: 'instrument' },
];

type AssignProposalsToReviewerModalProps = {
  assignProposalsToReviewer: (
    memberUsers: FapAssignedMember[],
    proposalPks: number[]
  ) => void;
  reviewers: FapAssignedMember[];
  setReviewers: React.Dispatch<React.SetStateAction<FapAssignedMember[]>>;
  fapProposalsData: FapProposalType[];
};

const AssignProposalsToReviewerModal = ({
  assignProposalsToReviewer,
  reviewers,
  setReviewers,
  fapProposalsData,
}: AssignProposalsToReviewerModalProps) => {
  const [selectedProposals, setSelectedProposals] = React.useState<number[]>(
    []
  );

  const [rankSelectorOpen, setRankSelectorOpen] = React.useState(false);

  return (
    <Dialog
      maxWidth="md"
      fullWidth
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={reviewers.length > 0}
      onClose={(): void => setReviewers([])}
    >
      <DialogContent>
        <MaterialTable
          title="Proposals to assign to reviewer"
          columns={columns}
          data={fapProposalsData.map((fapProposal) => ({
            proposalPk: fapProposal.proposalPk,
            proposalId: fapProposal.proposal.proposalId,
            title: fapProposal.proposal.title,
            instrument: fapProposal.instrument?.name || '-',
          }))}
          options={{
            selection: true,
          }}
          onSelectionChange={(data) => {
            setSelectedProposals(data.map((d) => d.proposalPk));
            console.log(
              'Selected proposal PKs:',
              data.map((d) => d.proposalPk)
            );
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={(): void => setReviewers([])} color="primary">
          Close
        </Button>
        <Button
          type="button"
          onClick={() => {
            assignProposalsToReviewer(reviewers, selectedProposals);
            setReviewers([]);
          }}
          disabled={selectedProposals.length === 0}
          data-cy="assign-selected-proposals"
        >
          Assign without Rankings
        </Button>
        <Button
          type="button"
          onClick={() => {
            setRankSelectorOpen(true);
          }}
          disabled={selectedProposals.length === 0}
          color="primary"
          data-cy="assign-selected-proposals-with-rank"
        >
          Assign with Rankings
        </Button>
        {rankSelectorOpen && (
          <MultiRankAssignmentDialog
            users={reviewers ? reviewers : []}
            open={rankSelectorOpen}
            setOpen={setRankSelectorOpen}
            assign={(users) => {
              assignProposalsToReviewer(users, selectedProposals);
              setReviewers([]);
            }}
          />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AssignProposalsToReviewerModal;
