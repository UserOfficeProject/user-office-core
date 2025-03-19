import MaterialTable from '@material-table/core';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
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
import {
  FapProposalAssignmentType,
  FapProposalType,
} from 'hooks/fap/useFapProposalsData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import RankInputModal from './RankInputModal';

type FapAssignedReviewersTableProps = {
  fapProposal: FapProposalType;
  fapSecs: number[];
  removeAssignedReviewer: (
    assignedReviewer: FapProposalAssignmentType,
    proposalPk: number
  ) => Promise<void>;
  updateView: (proposalPk: number) => Promise<void>;
};

const assignmentColumns = [
  {
    title: 'First name',
    field: 'user.firstname',
  },
  {
    title: 'Last name',
    field: 'user.lastname',
  },
  {
    title: 'Date assigned',
    field: 'dateAssignedFormatted',
  },
  {
    title: 'Rank',
    field: 'rank',
    emptyValue: '-',
    hidden: true,
  },
  { title: 'Review status', field: 'review.status' },
  {
    title: 'Grade',
    field: 'review.grade',
    emptyValue: '-',
  },
];

const FapAssignedReviewersTable = ({
  fapProposal,
  fapSecs,
  removeAssignedReviewer,
  updateView,
}: FapAssignedReviewersTableProps) => {
  const { api } = useDataApiWithFeedback();

  const [searchParams, setSearchParams] = useSearchParams();
  const reviewerModal = searchParams.get('reviewerModal');

  const [openProposalPk, setOpenProposalPk] = useState<number | null>(null);
  const hasAccessRights = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.FAP_CHAIR,
    UserRole.FAP_SECRETARY,
  ]);
  const [rankReviewer, setRankReviewer] = useState<null | {
    reviewer: number | null;
    proposal: number;
    rank: number | null;
  }>(null);
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

  assignmentColumns[
    assignmentColumns.findIndex((col) => col.field === 'rank')
  ].hidden = !hasAccessRights;

  const fapAssignmentsStringified = JSON.stringify(fapProposal.assignments);
  const getFapAssignments = useCallback(
    () =>
      fapProposal.assignments
        ?.map((fapAssignment) =>
          Object.assign(fapAssignment, {
            id: fapAssignment.fapMemberUserId,
            dateAssignedFormatted: toFormattedDateTime(
              fapAssignment.dateAssigned
            ),
          })
        )
        .sort((a, b) => {
          const order = (a.rank ? a.rank : 0) >= (b.rank ? b.rank : 0);

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

  const proposalReviewModalShouldOpen =
    !!reviewerModal && openProposalPk === fapProposal.proposalPk;

  const onProposalReviewModalClose = () => {
    setSearchParams((searchParams) => {
      searchParams.delete('reviewerModal');
      searchParams.delete('modalTab');

      return searchParams;
    });
    openProposalPk && updateView(openProposalPk);
    setOpenProposalPk(null);
  };

  const editableTableRow = hasAccessRights
    ? {
        deleteTooltip: () => 'Remove assignment',
        onRowDelete: (
          rowAssignmentsData: FapProposalAssignmentType
        ): Promise<void> =>
          removeAssignedReviewer(rowAssignmentsData, fapProposal.proposalPk),
      }
    : {};

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
        title={`Proposal: ${fapProposal.proposal.title} (${fapProposal.proposal.proposalId})`}
        proposalReviewModalOpen={proposalReviewModalShouldOpen}
        setProposalReviewModalOpen={onProposalReviewModalClose}
      >
        <ProposalReviewContent
          proposalPk={fapProposal.proposalPk}
          reviewId={reviewerModal ? +reviewerModal : undefined}
          fapId={fapProposal.fapId}
          fapSec={fapSecs}
          tabNames={reviewProposalTabNames}
        />
      </ProposalReviewModal>
      {rankReviewer && (
        <RankInputModal
          open={!!rankReviewer}
          onClose={() => setRankReviewer(null)}
          onSubmit={async (value) => {
            await api().saveReviewerRank({
              proposalPk: rankReviewer?.proposal as number,
              reviewerId: rankReviewer?.reviewer as number,
              rank: value,
            });
            const fapAssignmentsWithUpdatedRank =
              fapAssignmentsWithIdAndFormattedDate.map((fa) => ({
                ...fa,
                rank:
                  fa.proposalPk === rankReviewer?.proposal &&
                  fa.fapMemberUserId === rankReviewer.reviewer
                    ? value
                    : fa.rank,
              }));

            setFapAssignmentsWithIdAndFormattedDate(
              fapAssignmentsWithUpdatedRank
            );
            updateView(rankReviewer?.proposal as number);
          }}
          currentRank={rankReviewer?.rank}
          totalReviewers={fapProposal.assignments?.length ?? 0}
          takenRanks={
            fapProposal.assignments
              ? fapProposal.assignments
                  .filter(
                    (assignment) =>
                      assignment.rank !== null &&
                      assignment.user?.id !== rankReviewer?.reviewer
                  )
                  .map((assignment) => assignment.rank as number)
              : []
          }
        />
      )}

      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={'Assigned reviewers'}
        data={fapAssignmentsWithIdAndFormattedDate}
        editable={editableTableRow}
        actions={[
          (rowData) => ({
            icon: isDraftStatus(rowData?.review?.status)
              ? () => <RateReviewIcon data-cy="grade-proposal-icon" />
              : () => <Visibility data-cy="view-proposal-details-icon" />,
            onClick: () => {
              if (!rowData.review) {
                return;
              }

              setSearchParams((searchParams) => {
                if (rowData.review)
                  searchParams.set(
                    'reviewerModal',
                    rowData.review.id.toString()
                  );
                searchParams.set(
                  'modalTab',
                  isDraftStatus(rowData?.review?.status)
                    ? reviewProposalTabNames
                        .indexOf(PROPOSAL_MODAL_TAB_NAMES.GRADE)
                        .toString()
                    : reviewProposalTabNames
                        .indexOf(PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION)
                        .toString()
                );

                return searchParams;
              });
              setOpenProposalPk(fapProposal.proposalPk);
            },
            tooltip: isDraftStatus(rowData?.review?.status)
              ? 'Grade proposal'
              : 'View review',
          }),
          (rowData) => ({
            icon: () => <FormatListNumberedIcon data-cy="rank-reviewer" />,
            onClick: () => {
              setRankReviewer({
                proposal: rowData.proposalPk,
                reviewer: rowData.fapMemberUserId,
                rank: rowData.rank,
              });
            },
            tooltip: 'Rank Reviewer',
          }),
        ]}
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

export default FapAssignedReviewersTable;
