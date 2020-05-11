import { IconButton } from '@material-ui/core';
import { Edit, Visibility } from '@material-ui/icons';
import GetAppIcon from '@material-ui/icons/GetApp';
import MaterialTable from 'material-table';
import React, { useState } from 'react';
import { useHistory } from 'react-router';

import { ReviewStatus } from '../../generated/sdk';
import { useDownloadPDFProposal } from '../../hooks/useDownloadPDFProposal';
import { useUserWithReviewsData } from '../../hooks/useUserData';
import { tableIcons } from '../../utils/materialIcons';

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
  const history = useHistory();

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: UserWithReview) => (
    <>
      <IconButton onClick={() => setEditReviewID(rowData.reviewId)}>
        {rowData.status === 'SUBMITTED' ? <Visibility /> : <Edit />}
      </IconButton>
      <IconButton onClick={() => downloadPDFProposal(rowData.proposalId)}>
        <GetAppIcon />
      </IconButton>
    </>
  );
  const GetAppIconComponent = (): JSX.Element => <GetAppIcon />;

  const columns = [
    {
      title: 'Actions',
      cellStyle: { padding: 0, width: '10%' },
      sorting: false,
      render: RowActionButtons,
    },
    { title: 'Proposal ID', field: 'shortCode' },
    { title: 'Title', field: 'title' },
    { title: 'Grade', field: 'grade' },
    { title: 'Status', field: 'status' },
  ];

  if (editReviewID) {
    history.push(`/ProposalGrade/${editReviewID}`);
  }

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
              (rowData as UserWithReview[]).map(row => row.proposalId).join(',')
            );
          },
          position: 'toolbarOnSelect',
        },
      ]}
    />
  );
};

export default ProposalTableReviewer;
