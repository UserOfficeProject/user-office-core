import MaterialTable, { Column } from '@material-table/core';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import React, { useCallback, useState } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import StyledDialog from 'components/common/StyledDialog';
import { FapReviewTemplate, Review, TemplateGroupId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useCallsData } from 'hooks/call/useCallsData';
import { useReviewsData } from 'hooks/review/useReviewsData';
import { tableIcons } from 'utils/materialIcons';

import TemplatesTable, { TemplateRowDataType } from './TemplatesTable';

function CallsList(props: { filterTemplateId: number }) {
  const { calls, loadingCalls } = useCallsData({
    templateIds: [props.filterTemplateId],
  });
  const { toFormattedDateTime, timezone } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });

  const callListColumns = [
    { title: 'Short Code', field: 'shortCode' },
    {
      title: `Start Date(${timezone})`,
      field: 'startCallFormatted',
    },
    {
      title: `End Date(${timezone})`,
      field: 'endCallFormatted',
    },
  ];

  const callsWithFormattedDates = calls.map((call) => ({
    ...call,
    startCallFormatted: toFormattedDateTime(call.startCall),
    endCallFormatted: toFormattedDateTime(call.endCall),
  }));

  return (
    <MaterialTable
      icons={tableIcons}
      title="Calls"
      columns={callListColumns}
      data={callsWithFormattedDates}
      isLoading={loadingCalls}
    />
  );
}

function FapReviewsList(props: { filterTemplateId: number }) {
  const { reviewsData, loading } = useReviewsData({
    templateIds: [props.filterTemplateId],
  });

  const reviewListColumns = [
    {
      title: 'Review ID',
      field: 'reviewId',
      render: (review: Review) => (
        <ReactRouterLink to={`/Reviews?reviewModal=${review.id}`}>
          {review.id}
        </ReactRouterLink>
      ),
    },
    {
      title: `Grade`,
      field: 'grade',
    },
    {
      title: `Status`,
      field: 'status',
      render: (review: Review) => review.status,
    },
  ];

  return (
    <MaterialTable
      icons={tableIcons}
      title="Reviews"
      columns={reviewListColumns}
      data={reviewsData}
      isLoading={loading}
    />
  );
}

function CallsModal(props: {
  open: boolean;
  templateId?: number;
  onClose: () => void;
}) {
  return (
    <StyledDialog
      open={props.open}
      onClose={props.onClose}
      fullWidth={true}
      title="Calls using the template"
    >
      <CallsList filterTemplateId={props.templateId as number} />
      <ActionButtonContainer>
        <Button variant="text" onClick={() => props.onClose()}>
          Close
        </Button>
      </ActionButtonContainer>
    </StyledDialog>
  );
}

function ReviewsModal(props: {
  open: boolean;
  templateId?: number;
  onClose: () => void;
}) {
  return (
    <StyledDialog
      open={props.open}
      onClose={props.onClose}
      fullWidth={true}
      data-cy="reviews-modal"
      title="Reviews using the template"
    >
      <FapReviewsList filterTemplateId={props.templateId as number} />
      <ActionButtonContainer>
        <Button variant="text" onClick={() => props.onClose()}>
          Close
        </Button>
      </ActionButtonContainer>
    </StyledDialog>
  );
}
export type ReviewTemplateRowDataType = TemplateRowDataType & {
  callCount?: number;
  questionaryCount?: number;
};

type ReviewTemplatesTableProps = {
  dataProvider: () => Promise<
    Pick<
      FapReviewTemplate,
      | 'templateId'
      | 'name'
      | 'description'
      | 'isArchived'
      | 'callCount'
      | 'questionaryCount'
    >[]
  >;
};

function FapReviewTemplatesTable(props: ReviewTemplatesTableProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>();
  const [showTemplateCalls, setShowTemplateCalls] = useState<boolean>(false);
  const [showTemplateReviews, setShowTemplateReviews] =
    useState<boolean>(false);

  const NumberOfReviews = useCallback(
    (rowData: ReviewTemplateRowDataType) => (
      <Link
        onClick={() => {
          setSelectedTemplateId(rowData.templateId);
          setShowTemplateReviews(true);
        }}
        style={{ cursor: 'pointer' }}
        data-cy="reviews-count"
      >
        {rowData.questionaryCount || 0}
      </Link>
    ),
    []
  );

  // NOTE: Keeping the columns inside the component just because it needs NumberOfCalls which is wrapped with callback and uses setSelectedTemplateId.
  const columns: Column<ReviewTemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    {
      title: '# reviews',
      field: 'questionaryCount',
      editable: 'never',
      render: NumberOfReviews,
    },
  ];

  return (
    <>
      <TemplatesTable
        columns={columns}
        templateGroup={TemplateGroupId.FAP_REVIEW}
        isRowRemovable={(rowData) => {
          const reviewTemplateRowData = rowData as ReviewTemplateRowDataType;

          return (
            reviewTemplateRowData.callCount === 0 &&
            reviewTemplateRowData.questionaryCount === 0
          );
        }}
        dataProvider={props.dataProvider}
      />

      <CallsModal
        templateId={selectedTemplateId}
        onClose={() => setShowTemplateCalls(false)}
        open={showTemplateCalls}
      />
      <ReviewsModal
        templateId={selectedTemplateId}
        onClose={() => setShowTemplateReviews(false)}
        open={showTemplateReviews}
      />
    </>
  );
}

export default FapReviewTemplatesTable;
