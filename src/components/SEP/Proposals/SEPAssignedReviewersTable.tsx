import makeStyles from '@material-ui/core/styles/makeStyles';
import RateReviewIcon from '@material-ui/icons/RateReview';
import Visibility from '@material-ui/icons/Visibility';
import dateformat from 'dateformat';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React, { useState, useContext } from 'react';

import { useCheckAccess } from 'components/common/Can';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import { ReviewAndAssignmentContext } from 'context/ReviewAndAssignmentContextProvider';
import {
  SepProposal,
  SepAssignment,
  ReviewStatus,
  UserRole,
} from 'generated/sdk';
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
  sepProposal: SepProposal;
  removeAssignedReviewer: (
    assignedReviewer: SepAssignment,
    proposalId: number
  ) => Promise<void>;
  updateView: (currentAssignment: SepAssignment) => void;
};

const SEPAssignedReviewersTable: React.FC<SEPAssignedReviewersTableProps> = ({
  sepProposal,
  removeAssignedReviewer,
  updateView,
}) => {
  const [editReviewID, setEditReviewID] = useState<null | number>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const classes = useStyles();
  const { setCurrentAssignment, currentAssignment } = useContext(
    ReviewAndAssignmentContext
  );
  const hasAccessRights = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
  ]);

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
      field: 'dateAssigned',
      render: (rowData: SepAssignment): string =>
        dateformat(new Date(rowData.dateAssigned), 'dd-mmm-yyyy HH:MM:ss'),
    },
    { title: 'Status', field: 'review.status' },
    {
      title: 'Grade',
      render: (rowData: SepAssignment) =>
        rowData.review.grade ? rowData.review.grade : '-',
    },
  ];

  const RateReviewIconComponent = (): JSX.Element => <RateReviewIcon />;

  return (
    <div className={classes.root} data-cy="sep-reviewer-assignments-table">
      {editReviewID && (
        <ProposalReviewModal
          editReviewID={editReviewID as number}
          reviewModalOpen={reviewModalOpen}
          setReviewModalOpen={() => {
            setReviewModalOpen(false);
            updateView(currentAssignment as SepAssignment);
          }}
        />
      )}
      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={'Assigned reviewers'}
        data={sepProposal.assignments as SepAssignment[]}
        editable={
          hasAccessRights
            ? {
                onRowDelete: (
                  rowAssignmentsData: SepAssignment
                ): Promise<void> =>
                  removeAssignedReviewer(
                    rowAssignmentsData,
                    sepProposal.proposalId
                  ),
              }
            : {}
        }
        actions={[
          rowData => ({
            icon:
              rowData.review.status === ReviewStatus.DRAFT
                ? RateReviewIconComponent
                : () => <Visibility />,
            onClick: () => {
              setEditReviewID(rowData.review.id);
              setCurrentAssignment({
                ...rowData,
                proposalId: sepProposal.proposalId,
              });
              setReviewModalOpen(true);
            },
            tooltip:
              rowData.review.status === ReviewStatus.DRAFT
                ? 'Review proposal'
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

SEPAssignedReviewersTable.propTypes = {
  sepProposal: PropTypes.any.isRequired,
  removeAssignedReviewer: PropTypes.func.isRequired,
  updateView: PropTypes.func.isRequired,
};

export default SEPAssignedReviewersTable;
