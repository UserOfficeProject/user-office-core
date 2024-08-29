import MaterialTable from '@material-table/core';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import RateReviewIcon from '@mui/icons-material/RateReview';
import Visibility from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import React, { useCallback, useEffect, useState } from 'react';
import { NumberParam, useQueryParams } from 'use-query-params';

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
  removeAssignedReviewer,
  updateView,
}: FapAssignedReviewersTableProps) => {
  const { api } = useDataApiWithFeedback();
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    reviewerModal: NumberParam,
    modalTab: NumberParam,
  });
  const [openProposalPk, setOpenProposalPk] = useState<number | null>(null);
  const hasAccessRights = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.FAP_CHAIR,
    UserRole.FAP_SECRETARY,
  ]);
  const [rankReviewer, setRankReviewer] = useState<null | {
    reviewer: number | null;
    proposal: number;
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
    !!urlQueryParams.reviewerModal && openProposalPk === fapProposal.proposalPk;

  const onProposalReviewModalClose = () => {
    setUrlQueryParams({ reviewerModal: undefined, modalTab: undefined });
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
          reviewId={urlQueryParams.reviewerModal}
          fapId={fapProposal.fapId}
          tabNames={reviewProposalTabNames}
        />
      </ProposalReviewModal>
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
        }}
      />

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

              setUrlQueryParams({
                modalTab: isDraftStatus(rowData?.review?.status)
                  ? reviewProposalTabNames.indexOf(
                      PROPOSAL_MODAL_TAB_NAMES.GRADE
                    )
                  : reviewProposalTabNames.indexOf(
                      PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION
                    ),
                reviewerModal: rowData.review.id,
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
