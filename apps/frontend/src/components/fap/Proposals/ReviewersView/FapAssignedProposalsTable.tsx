import MaterialTable from '@material-table/core';
import RateReviewIcon from '@mui/icons-material/RateReview';
import Visibility from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import { ReviewStatus, UserRole, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { FapProposalAssignmentType } from 'hooks/fap/useFapProposalsData';
import { tableIcons } from 'utils/materialIcons';

type AssignedProposal = {
  proposal: {
    proposalPk: number;
    proposalId: string;
    title: string;
  };
  assignment: FapProposalAssignmentType;
};

type FapAssignedProposalsTableProps = {
  assignedProposals: AssignedProposal[];
  fapSecs: number[];
  removeAssignedReviewer: (
    assignedReviewer: FapProposalAssignmentType,
    proposalPk: number
  ) => Promise<void>;
  updateView: (proposalPk: number) => Promise<void>;
  editable?: boolean;
};

const FapAssignedProposalsTable = ({
  assignedProposals,
  fapSecs,
  removeAssignedReviewer,
  updateView,
  editable = true,
}: FapAssignedProposalsTableProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const reviewerModal = searchParams.get('reviewerModal');

  const [openProposalPk, setOpenProposalPk] = useState<number | null>(null);
  const [proposal, setProposal] = useState<{
    proposalPk: number;
    proposalId: string;
    title: string;
  } | null>(null);
  const hasAccessRights = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.FAP_CHAIR,
    UserRole.FAP_SECRETARY,
  ]);
  const { toFormattedDateTime } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const isDraftStatus = (status?: ReviewStatus) =>
    status === ReviewStatus.DRAFT;

  const reviewProposalTabNames = [
    PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
    PROPOSAL_MODAL_TAB_NAMES.TECHNICAL_REVIEW,
    PROPOSAL_MODAL_TAB_NAMES.GRADE,
  ];

  const fapAssignmentsStringified = JSON.stringify(assignedProposals);
  const getFapAssignments = useCallback(
    () =>
      assignedProposals
        .map((aps) => {
          const { proposal, assignment } = aps;

          return {
            proposal,
            assignment: {
              ...assignment,
              dateAssignedFormatted: toFormattedDateTime(
                assignment.dateAssigned
              ),
            },
          };
        })
        .sort((a, b) => {
          const order =
            (a.assignment.rank ? a.assignment.rank : 0) >=
            (b.assignment.rank ? b.assignment.rank : 0);

          return order ? 1 : -1;
        }) || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fapAssignmentsStringified]
  );

  const [
    fapAssignmentsWithIdAndFormattedDate,
    setFapAssignmentsWithIdAndFormattedDate,
  ] = useState(getFapAssignments());

  useEffect(() => {
    setFapAssignmentsWithIdAndFormattedDate(getFapAssignments());
  }, [getFapAssignments]);

  const assignmentColumns = [
    {
      title: 'Proposal ID',
      field: 'proposal.proposalId',
    },
    {
      title: 'Proposal title',
      field: 'proposal.title',
      cellStyle: {
        maxWidth: '400px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },
    {
      title: 'Instrument',
      field: 'proposal.instrument',
    },
    {
      title: 'Date assigned',
      field: 'assignment.dateAssignedFormatted',
    },
    {
      title: 'Rank',
      field: 'assignment.rank',
      emptyValue: '-',
      hidden: !hasAccessRights,
    },
    { title: 'Review status', field: 'assignment.review.status' },
    {
      title: 'Grade',
      field: 'assignment.review.grade',
      emptyValue: '-',
    },
  ];

  const proposalReviewModalShouldOpen = !!reviewerModal;

  const onProposalReviewModalClose = () => {
    setSearchParams((searchParams) => {
      searchParams.delete('reviewerModal');
      searchParams.delete('modalTab');

      return searchParams;
    });
    openProposalPk && updateView(openProposalPk);
    setOpenProposalPk(null);
  };

  const editableTableRow =
    editable && hasAccessRights
      ? {
          deleteTooltip: () => 'Remove assignment',
          onRowDelete: (rowdata: AssignedProposal): Promise<void> =>
            removeAssignedReviewer(
              rowdata.assignment,
              rowdata.proposal.proposalPk
            ),
        }
      : {};

  const reviewProposals = (
    review: {
      id: number;
      status: ReviewStatus | undefined;
    } | null
  ) => {
    if (!review) {
      return;
    }

    setSearchParams((searchParams) => {
      if (review) searchParams.set('reviewerModal', review.id.toString());
      searchParams.set(
        'modalTab',
        isDraftStatus(review?.status)
          ? reviewProposalTabNames
              .indexOf(PROPOSAL_MODAL_TAB_NAMES.GRADE)
              .toString()
          : reviewProposalTabNames
              .indexOf(PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION)
              .toString()
      );

      return searchParams;
    });
    const proposal = assignedProposals.find(
      (aps) =>
        aps.assignment.review?.id === review.id ||
        aps.assignment.review?.id === review.id
    )?.proposal;
    if (proposal) {
      setOpenProposalPk(proposal.proposalPk);
    }
  };

  return (
    <Box
      sx={{
        '& tr:last-child td': {
          border: 'none',
        },
        '& .MuiPaper-root': {
          padding: '0 40px',
          backgroundColor: '#fafafa',
        },
      }}
      data-cy="fap-reviewer-assignments-table"
    >
      <ProposalReviewModal
        title={`Proposal: ${proposal?.title} (${proposal?.proposalId})`}
        proposalReviewModalOpen={proposalReviewModalShouldOpen}
        setProposalReviewModalOpen={onProposalReviewModalClose}
      >
        <ProposalReviewContent
          proposalPk={proposal?.proposalPk}
          reviewId={reviewerModal ? +reviewerModal : undefined}
          fapId={assignedProposals[0]?.assignment.review?.fapID} //dumb
          fapSec={fapSecs}
          tabNames={reviewProposalTabNames}
        />
      </ProposalReviewModal>
      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={'Assign Proposals'}
        data={fapAssignmentsWithIdAndFormattedDate}
        editable={editableTableRow}
        actions={
          editable
            ? [
                (rowData) => ({
                  icon: isDraftStatus(rowData?.assignment.review?.status)
                    ? () => <RateReviewIcon data-cy="grade-proposal-icon" />
                    : () => <Visibility data-cy="view-proposal-details-icon" />,
                  onClick: () => {
                    reviewProposals(rowData.assignment.review);
                    setProposal(rowData.proposal);
                  },
                  tooltip: isDraftStatus(rowData.assignment.review?.status)
                    ? 'Grade proposal'
                    : 'View review',
                }),
              ]
            : [
                (rowData) => ({
                  icon: () => (
                    <Visibility data-cy="view-proposal-details-icon" />
                  ),
                  onClick: () => reviewProposals(rowData.assignment.review),
                  tooltip: 'View review',
                }),
              ]
        }
        options={{
          search: false,
          paging: false,
          toolbar: false,
          headerStyle: { backgroundColor: '#fafafa' },
        }}
      />
    </Box>
  );
};

export default FapAssignedProposalsTable;
