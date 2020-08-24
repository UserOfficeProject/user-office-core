import { IconButton } from '@material-ui/core';
import { Visibility, People, ArrowBack } from '@material-ui/icons';
import MaterialTable, { Action } from 'material-table';
import React, { useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import { Review, UserRole } from 'generated/sdk';
import { tableIcons } from 'utils/materialIcons';

import ProposalGrade from './ProposalGrade';

export default function ReviewTable(props: {
  data: Review[];
  addReviewer: any;
  removeReview: any;
  onChange: any;
}) {
  // const reviewAverage =
  //   props.reviews.reduce((acc, curr) => acc + curr.grade, 0) /
  //   props.reviews.length;
  const [editReviewID, setEditReviewID] = useState(0);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const columns = [
    {
      title: 'Reviewer',
      render: (rowData: any) =>
        `${rowData.reviewer.firstname} ${rowData.reviewer.lastname}`,
    },
    { title: 'Grade', field: 'grade' },
    { title: 'Status', field: 'status' },
  ];

  if (editReviewID) {
    return (
      <>
        <IconButton aria-label="back" onClick={() => setEditReviewID(0)}>
          <ArrowBack />
        </IconButton>
        <ProposalGrade reviewID={editReviewID} onChange={props.onChange} />
      </>
    );
  }

  const actions: (Action<Review> | ((rowData: Review) => Action<Review>))[] = [
    {
      icon: () => <Visibility />,
      tooltip: 'View review',
      onClick: (event, rowData) => {
        setEditReviewID((rowData as Review).id);
      },
      position: 'row',
    },
  ];

  if (isUserOfficer) {
    actions.push({
      icon: () => <People />,
      isFreeAction: true,
      tooltip: 'Add Reviewer',
      onClick: () => props.addReviewer(true),
    });
  }

  return (
    <MaterialTable
      icons={tableIcons}
      title={'Excellence Review'}
      columns={columns}
      data={props.data}
      editable={
        isUserOfficer
          ? {
              onRowDelete: (oldData: Review) =>
                new Promise(resolve => {
                  resolve();
                  props.removeReview(oldData.id);
                }),
            }
          : {}
      }
      options={{
        search: false,
      }}
      actions={actions}
    />
  );
}
