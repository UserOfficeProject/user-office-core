import { makeStyles } from '@material-ui/core';
import { Visibility } from '@material-ui/icons';
import RateReviewIcon from '@material-ui/icons/RateReview';
import dateformat from 'dateformat';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React, { useState, useContext } from 'react';

import { UserContext } from '../../context/UserContextProvider';
import { SepProposal, SepAssignment, ReviewStatus } from '../../generated/sdk';
import { tableIcons } from '../../utils/materialIcons';
import ProposalReviewModal from '../review/ProposalReviewModal';
import AssignmentProvider from './SEPCurrentAssignmentProvider';

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
  updateView: () => void;
};

const SEPAssignedReviewersTable: React.FC<SEPAssignedReviewersTableProps> = ({
  sepProposal,
  removeAssignedReviewer,
  updateView,
}) => {
  const [editReviewID, setEditReviewID] = useState<null | number>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const classes = useStyles();
  const { currentRole } = useContext(UserContext);

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

  const hasAccessRights = [
    'user_officer',
    'SEP_Chair',
    'SEP_Secretary',
  ].includes(currentRole);

  return (
    <div className={classes.root} data-cy="sep-reviewer-assignments-table">
      {editReviewID && (
        <ProposalReviewModal
          editReviewID={editReviewID as number}
          reviewModalOpen={reviewModalOpen}
          setReviewModalOpen={() => {
            setReviewModalOpen(false);
            updateView();
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
              AssignmentProvider.setCurrentAssignment({
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
