import MaterialTable from '@material-table/core';
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
  SEPProposalAssignmentType,
  SEPProposalType,
} from 'hooks/SEP/useSEPProposalsData';
import { tableIcons } from 'utils/materialIcons';

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

type SEPAssignedReviewersTableProps = {
  sepProposal: SEPProposalType;
  removeAssignedReviewer: (
    assignedReviewer: SEPProposalAssignmentType,
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
  { title: 'Review status', field: 'review.status' },
  {
    title: 'Grade',
    field: 'review.grade',
    emptyValue: '-',
  },
];

const SEPAssignedReviewersTable = ({
  sepProposal,
  removeAssignedReviewer,
  updateView,
}: SEPAssignedReviewersTableProps) => {
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    reviewerModal: NumberParam,
    modalTab: NumberParam,
  });
  const classes = useStyles();
  const [openProposalPk, setOpenProposalPk] = useState<number | null>(null);
  const hasAccessRights = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
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

  const SEPAssignmentsWithIdAndFormattedDate =
    sepProposal.assignments?.map((sepAssignment) =>
      Object.assign(sepAssignment, {
        id: sepAssignment.sepMemberUserId,
        dateAssignedFormatted: toFormattedDateTime(sepAssignment.dateAssigned),
      })
    ) || [];
  const proposalReviewModalShouldOpen =
    !!urlQueryParams.reviewerModal && openProposalPk === sepProposal.proposalPk;

  const onProposalReviewModalClose = () => {
    setUrlQueryParams({ reviewerModal: undefined, modalTab: undefined });
    openProposalPk && updateView(openProposalPk);
    setOpenProposalPk(null);
  };

  const editableTableRow = hasAccessRights
    ? {
        deleteTooltip: () => 'Remove assignment',
        onRowDelete: (
          rowAssignmentsData: SEPProposalAssignmentType
        ): Promise<void> =>
          removeAssignedReviewer(rowAssignmentsData, sepProposal.proposalPk),
      }
    : {};

  return (
    <div className={classes.root} data-cy="sep-reviewer-assignments-table">
      <ProposalReviewModal
        title={`Proposal: ${sepProposal.proposal.title} (${sepProposal.proposal.proposalId})`}
        proposalReviewModalOpen={proposalReviewModalShouldOpen}
        setProposalReviewModalOpen={onProposalReviewModalClose}
      >
        <ProposalReviewContent
          reviewId={urlQueryParams.reviewerModal}
          sepId={sepProposal.sepId}
          tabNames={reviewProposalTabNames}
        />
      </ProposalReviewModal>

      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={'Assigned reviewers'}
        data={SEPAssignmentsWithIdAndFormattedDate}
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
              setOpenProposalPk(sepProposal.proposalPk);
            },
            tooltip: isDraftStatus(rowData?.review?.status)
              ? 'Grade proposal'
              : 'View review',
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

export default SEPAssignedReviewersTable;
