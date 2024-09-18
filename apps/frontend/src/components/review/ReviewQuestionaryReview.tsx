import { TableProps } from '@mui/material';
import React, { FunctionComponent } from 'react';

import UOLoader from 'components/common/UOLoader';
import { TableRowData } from 'components/questionary/QuestionaryDetails';
import { ReviewStatus } from 'generated/sdk';
import { FapReviewWithQuestionary } from 'models/questionary/fapReview/FapReviewWithQuestionary';
import stripHtml from 'utils/stripHtml';
import { truncateString } from 'utils/truncateString';

import ReviewQuestionaryDetails from './ReviewQuestionaryDetails';

export default function ReviewQuestionaryReview(
  props: {
    data: FapReviewWithQuestionary;
  } & TableProps<FunctionComponent<unknown>>
) {
  const { data, ...restProps } = props;

  if (!data.questionaryID) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const additionalDetails: TableRowData[] = [
    {
      label: 'Review ID',
      value:
        data.status === ReviewStatus.DRAFT
          ? data.id + ' (Pre-submission)'
          : data.id.toString(),
    },
    {
      label: 'Comment',
      value: truncateString(stripHtml(data.comment || ''), 100),
    },
    { label: 'Grade', value: data.grade ? data.grade.toString() : '' },
  ];

  return (
    <ReviewQuestionaryDetails
      questionaryId={data.questionaryID}
      questionaryData={data.questionary}
      additionalDetails={additionalDetails}
      title="Proposal information"
      id={data.id}
      {...restProps}
    />
  );
}
