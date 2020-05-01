import { Edit, Visibility } from '@material-ui/icons';
import GetAppIcon from '@material-ui/icons/GetApp';
import MaterialTable from 'material-table';
import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router';
import ProposalGrade from './ProposalGrade';
import { UserContext } from '../../context/UserContextProvider';
import { useDownloadPDFProposal } from '../../hooks/useDownloadPDFProposal';
import { useUserWithReviewsData } from '../../hooks/useUserData';
import { tableIcons } from '../../utils/tableIcons';

export default function ProposalTableReviewer() {
  const { user } = useContext(UserContext);
  const { loading, userData } = useUserWithReviewsData(user.id);
  const downloadPDFProposal = useDownloadPDFProposal();

  const columns = [
    { title: 'Proposal ID', field: 'shortCode' },
    { title: 'Title', field: 'title' },
    { title: 'Grade', field: 'grade' },
    { title: 'Status', field: 'status' },
  ];

  const [editReviewID, setEditReviewID] = useState(0);

  if (editReviewID) {
    return (
      <ProposalGrade
        reviewID={editReviewID}
        onChange={() => console.log('updated')}
      />
    );
  }

  if (loading) {
    return <p>Loading</p>;
  }
  const reviewData = userData.reviews.map(review => {
    return {
      shortCode: review.proposal.shortCode,
      proposalId: review.proposal.id,
      title: review.proposal.title,
      grade: review.grade,
      reviewId: review.id,
      comment: review.comment,
      status: review.status,
    };
  });

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
          position: 'row',
          action: rowData => {
            return {
              position: 'row',
              icon:
                rowData.status === 'SUBMITTED'
                  ? () => <Visibility />
                  : () => <Edit />,
              tooltip:
                rowData.status === 'SUBMITTED'
                  ? 'View proposal'
                  : 'Edit proposal',
              onClick: (event, rowData) => setEditReviewID(rowData.reviewId),
            };
          },
        },
        {
          icon: () => <GetAppIcon />,
          tooltip: 'Download proposal',
          onClick: (event, rowData) => downloadPDFProposal(rowData.proposalId),
          position: 'row',
        },
        {
          icon: () => <GetAppIcon />,
          tooltip: 'Download proposals',
          onClick: (event, rowData) => {
            downloadPDFProposal(rowData.map(row => row.proposalId).join(','));
          },
          position: 'toolbarOnSelect',
        },
      ]}
    />
  );
}
