import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import GetAppIcon from '@material-ui/icons/GetApp';
import RateReviewIcon from '@material-ui/icons/RateReview';
import Visibility from '@material-ui/icons/Visibility';
import MaterialTable from 'material-table';
import React, { useState, useContext } from 'react';

import { ReviewAndAssignmentContext } from 'context/ReviewAndAssignmentContextProvider';
import {
  ReviewStatus,
  SepAssignment,
  UserWithReviewsQuery,
} from 'generated/sdk';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { useUserWithReviewsData } from 'hooks/user/useUserData';
import { tableIcons } from 'utils/materialIcons';

import ProposalReviewModal from './ProposalReviewModal';

type UserWithReview = {
  shortCode: string;
  proposalId: number;
  title: string;
  grade: number;
  reviewId: number;
  comment: string;
  status: ReviewStatus;
};

const ProposalTableReviewer: React.FC = () => {
  const { loading, userData, setUserData } = useUserWithReviewsData();
  const downloadPDFProposal = useDownloadPDFProposal();
  const [editReviewID, setEditReviewID] = useState(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const { currentAssignment } = useContext(ReviewAndAssignmentContext);

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: UserWithReview) => (
    <>
      <Tooltip title="Review proposal">
        <IconButton
          onClick={() => {
            setEditReviewID(rowData.reviewId);
            setReviewModalOpen(true);
          }}
        >
          {rowData.status === 'SUBMITTED' ? <Visibility /> : <RateReviewIcon />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Download review">
        <IconButton onClick={() => downloadPDFProposal(rowData.proposalId)}>
          <GetAppIcon />
        </IconButton>
      </Tooltip>
    </>
  );
  const GetAppIconComponent = (): JSX.Element => <GetAppIcon />;

  const columns = [
    {
      title: 'Actions',
      cellStyle: { padding: 0, minWidth: 120 },
      sorting: false,
      render: RowActionButtons,
    },
    { title: 'Proposal ID', field: 'shortCode' },
    { title: 'Title', field: 'title' },
    { title: 'Grade', field: 'grade' },
    { title: 'Review status', field: 'status' },
  ];

  const reviewData = userData
    ? (userData.reviews.map(review => {
        return {
          shortCode: review?.proposal?.shortCode,
          proposalId: review?.proposal?.id,
          title: review?.proposal?.title,
          grade: review.grade,
          reviewId: review.id,
          comment: review.comment,
          status: review.status,
        };
      }) as UserWithReview[])
    : [];

  const updateView = () => {
    if (currentAssignment) {
      const currentReview = (currentAssignment as SepAssignment).review;

      const userDataUpdated = {
        ...userData,
        reviews: userData?.reviews.map(review => {
          if (review.id === currentReview.id) {
            return {
              ...review,
              grade: currentReview.grade,
              status: currentReview.status,
            };
          } else {
            return review;
          }
        }),
      };

      setUserData(userDataUpdated as UserWithReviewsQuery['me']);
    }
  };

  return (
    <>
      <ProposalReviewModal
        editReviewID={editReviewID}
        reviewModalOpen={reviewModalOpen}
        setReviewModalOpen={() => {
          setReviewModalOpen(false);
          updateView();
        }}
      />
      <MaterialTable
        icons={tableIcons}
        title={'Proposals to review'}
        columns={columns}
        data={reviewData}
        isLoading={loading}
        options={{
          search: false,
          selection: true,
        }}
        localization={{
          toolbar: {
            nRowsSelected: '{0} proposal(s) selected',
          },
        }}
        actions={[
          {
            icon: GetAppIconComponent,
            tooltip: 'Download proposals',
            onClick: (event, rowData) => {
              downloadPDFProposal(
                (rowData as UserWithReview[])
                  .map(row => row.proposalId)
                  .join(',')
              );
            },
            position: 'toolbarOnSelect',
          },
        ]}
      />
    </>
  );
};

export default ProposalTableReviewer;
