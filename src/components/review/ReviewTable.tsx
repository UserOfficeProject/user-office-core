/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { IconButton } from '@material-ui/core';
import { Visibility, People, ArrowBack } from '@material-ui/icons';
import MaterialTable from 'material-table';
import React, { useState } from 'react';

import { Review } from '../../generated/sdk';
import { tableIcons } from '../../utils/materialIcons';
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

  return (
    <MaterialTable
      icons={tableIcons}
      title={'Excellence Review'}
      columns={columns}
      data={props.data}
      editable={{
        onRowDelete: (oldData: Review) =>
          new Promise(resolve => {
            resolve();
            props.removeReview(oldData.id);
          }),
      }}
      options={{
        search: false,
      }}
      actions={[
        {
          icon: () => <Visibility />,
          tooltip: 'View review',
          // @ts-ignore
          onClick: (event, rowData: review) => {
            setEditReviewID(rowData.id);
          },
          position: 'row',
        },
        {
          icon: () => <People />,
          isFreeAction: true,
          tooltip: 'Add Reviewer',
          onClick: () => props.addReviewer(true),
        },
      ]}
    />
  );
}
