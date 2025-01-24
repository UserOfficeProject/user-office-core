import { TableProps } from '@mui/material';
import React, { FunctionComponent } from 'react';

import UOLoader from 'components/common/UOLoader';
import { TableRowData } from 'components/questionary/QuestionaryDetails';
import stripHtml from 'utils/stripHtml';

import ReviewQuestionaryDetails from './ReviewQuestionaryDetails';
import { TechnicalReviewWithQuestionary } from '../../models/questionary/technicalReview/TechnicalReviewWithQuestionary';

export default function TechnicalReviewQuestionaryReview(
  props: {
    data: TechnicalReviewWithQuestionary;
  } & TableProps<FunctionComponent<unknown>>
) {
  const { data, ...restProps } = props;

  if (!data.questionaryId) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const additionalDetails: TableRowData[] = [
    {
      label: 'Technical Review ID',
      value: !data.submitted
        ? data.id + ' (Pre-submission)'
        : data.id.toString(),
    },
    {
      label: 'Status',
      value: data.status || '',
    },
    {
      label: `Time allocation(${data.proposal?.call?.allocationTimeUnit}s)`,
      value: data.timeAllocation?.toString() || '',
    },
    {
      label: 'Comment',
      value: stripHtml(data.comment || ''),
    },
    { label: 'Public Comment', value: stripHtml(data.comment || '') },
  ];

  return (
    <ReviewQuestionaryDetails
      questionaryId={data.questionaryId}
      questionaryData={data.questionary}
      additionalDetails={additionalDetails}
      title="Proposal information"
      id={data.id}
      {...restProps}
    />
  );
}
