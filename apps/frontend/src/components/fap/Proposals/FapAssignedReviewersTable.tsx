import MaterialTable from '@material-table/core';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import RateReviewIcon from '@mui/icons-material/RateReview';
import Visibility from '@mui/icons-material/Visibility';
import makeStyles from '@mui/styles/makeStyles';
import React, { useState } from 'react';
import { NumberParam, useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import { ReviewStatus, UserRole, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import {
  FapProposalAssignmentType,
  FapProposalType,
} from 'hooks/fap/useFapProposalsData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import RankInputModal from './RankInputModal';

// NOTE: Some custom styles for row expand table.
const useStyles = makeStyles(() => ({
  root: {
    '& tr:last-child td': {
      border: 'none',
    },
    '& .MuiPaper-root': {
      padding: '0 40px',
      backgroundColor: '#fafafa',
    },
  },
}));

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
    title: 'rank',
    field: 'rank',
    emptyValue: '-',
  },
  {
    title: 'Date assigned',
    field: 'dateAssignedFormatted',
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
  const classes = useStyles();
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

  const FapAssignmentsWithIdAndFormattedDate =
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
      }) || [];

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
    <div className={classes.root} data-cy="fap-reviewer-assignments-table">
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
        onSubmit={(value) => {
          api().saveReviewerRank({
            proposalPk: rankReviewer?.proposal as number,
            reviewerId: rankReviewer?.reviewer as number,
            rank: value,
          });
          updateView(rankReviewer?.proposal as number);
          setRankReviewer(null);
        }}
      />

      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={'Assigned reviewers'}
        data={FapAssignmentsWithIdAndFormattedDate}
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
    </div>
  );
};

export default FapAssignedReviewersTable;
