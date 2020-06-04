import { IconButton, Tooltip } from '@material-ui/core';
import { Visibility } from '@material-ui/icons';
import GetAppIcon from '@material-ui/icons/GetApp';
import RateReviewIcon from '@material-ui/icons/RateReview';
import MaterialTable from 'material-table';
import React, { useState } from 'react';

import { ReviewStatus } from '../../generated/sdk';
import { useDownloadPDFProposal } from '../../hooks/useDownloadPDFProposal';
import { useUserWithReviewsData } from '../../hooks/useUserData';
import { tableIcons } from '../../utils/materialIcons';
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
  const { loading, userData } = useUserWithReviewsData();
  const downloadPDFProposal = useDownloadPDFProposal();
  const [editReviewID, setEditReviewID] = useState(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

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
    { title: 'Status', field: 'status' },
  ];

  if (loading) {
    return <p>Loading</p>;
  }

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

  return (
    <>
      <ProposalReviewModal
        editReviewID={editReviewID}
        reviewModalOpen={reviewModalOpen}
        setReviewModalOpen={setReviewModalOpen}
      />
      <MaterialTable
        icons={tableIcons}
        title={'Proposals to review'}
        columns={columns}
        data={reviewData}
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
