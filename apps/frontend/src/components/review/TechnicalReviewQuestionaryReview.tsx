import { TableProps } from '@mui/material';
import React, { FunctionComponent } from 'react';

import { DownloadableFileList } from 'components/common/DownloadableFileList';
import UOLoader from 'components/common/UOLoader';
import { TableRowData } from 'components/questionary/QuestionaryDetails';
import { UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import stripHtml from 'utils/stripHtml';

import ReviewQuestionaryDetails from './ReviewQuestionaryDetails';
import { TechnicalReviewWithQuestionary } from '../../models/questionary/technicalReview/TechnicalReviewWithQuestionary';

export default function TechnicalReviewQuestionaryReview(
  props: {
    data: TechnicalReviewWithQuestionary;
  } & TableProps<FunctionComponent<unknown>>
) {
  const internalUser = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.FAP_SECRETARY,
    UserRole.INSTRUMENT_SCIENTIST,
    UserRole.INTERNAL_REVIEWER,
  ]);

  const { data, ...restProps } = props;

  const fileId: { id: string }[] = data.files ? JSON.parse(data.files) : [];

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
    { label: 'Public Comment', value: stripHtml(data.publicComment || '') },
  ];

  internalUser &&
    additionalDetails.push(
      {
        label: 'Internal Comment',
        value: stripHtml(data.comment || ''),
      },
      {
        label: 'Internal Documents',
        value: <DownloadableFileList fileIds={fileId.map((file) => file.id)} />,
      }
    );

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
