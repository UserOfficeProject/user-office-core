import MaterialTable, { Column } from '@material-table/core';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import React, { useCallback, useState } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import StyledDialog from 'components/common/StyledDialog';
import {
  TechnicalReview,
  TechnicalReviewTemplate,
  TemplateGroupId,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useCallsData } from 'hooks/call/useCallsData';
import { useTechnicalReviewsData } from 'hooks/technicalReview/useTechnicalReviewsData';
import { tableIcons } from 'utils/materialIcons';

import TemplatesTable, { TemplateRowDataType } from './TemplatesTable';

function CallsList(props: { filterTemplateId: number }) {
  const { calls, loadingCalls } = useCallsData({
    technicalReviewTemplateIds: [props.filterTemplateId],
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

function TechnicalReviewsList(props: { filterTemplateId: number }) {
  const { technicalReviewsData, loading } = useTechnicalReviewsData({
    templateIds: [props.filterTemplateId],
  });

  const reviewListColumns = [
    {
      title: 'Review ID',
      field: 'reviewId',
      render: (technicalReview: TechnicalReview) => (
        <ReactRouterLink
          to={`/?reviewModal=${technicalReview.proposalPk}&modalTab=1`}
        >
          {technicalReview.id}
        </ReactRouterLink>
      ),
    },
    {
      title: `Status`,
      field: 'status',
      render: (review: TechnicalReview) => review.status,
    },
  ];

  return (
    <MaterialTable
      icons={tableIcons}
      title="Technical Reviews"
      columns={reviewListColumns}
      data={technicalReviewsData}
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

function TechnicalReviewsModal(props: {
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
      <TechnicalReviewsList filterTemplateId={props.templateId as number} />
      <ActionButtonContainer>
        <Button variant="text" onClick={() => props.onClose()}>
          Close
        </Button>
      </ActionButtonContainer>
    </StyledDialog>
  );
}
export type TechnicalReviewTemplateRowDataType = TemplateRowDataType & {
  callCount?: number;
  questionaryCount?: number;
};

type ReviewTemplatesTableProps = {
  dataProvider: () => Promise<
    Pick<
      TechnicalReviewTemplate,
      | 'templateId'
      | 'name'
      | 'description'
      | 'isArchived'
      | 'callCount'
      | 'questionaryCount'
    >[]
  >;
};

function TechnicalReviewTemplatesTable(props: ReviewTemplatesTableProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>();
  const [showTemplateCalls, setShowTemplateCalls] = useState<boolean>(false);
  const [showTemplateTechnicalReviews, setShowTemplateTechnicalReviews] =
    useState<boolean>(false);

  const NumberOfCalls = useCallback(
    (rowData: TechnicalReviewTemplateRowDataType) => (
      <Link
        onClick={() => {
          setSelectedTemplateId(rowData.templateId);
          setShowTemplateCalls(true);
        }}
        style={{ cursor: 'pointer' }}
      >
        {rowData.callCount || 0}
      </Link>
    ),
    []
  );

  const NumberOfReviews = useCallback(
    (rowData: TechnicalReviewTemplateRowDataType) => (
      <Link
        onClick={() => {
          setSelectedTemplateId(rowData.templateId);
          setShowTemplateTechnicalReviews(true);
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
  const columns: Column<TechnicalReviewTemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    {
      title: '# reviews',
      field: 'questionaryCount',
      editable: 'never',
      render: NumberOfReviews,
    },
    {
      title: '# calls',
      field: 'callCount',
      editable: 'never',
      render: NumberOfCalls,
    },
  ];

  return (
    <>
      <TemplatesTable
        columns={columns}
        templateGroup={TemplateGroupId.TECHNICAL_REVIEW}
        isRowRemovable={(rowData) => {
          const technicalReviewTemplateRowData =
            rowData as TechnicalReviewTemplateRowDataType;

          return (
            technicalReviewTemplateRowData.callCount === 0 &&
            technicalReviewTemplateRowData.questionaryCount === 0
          );
        }}
        dataProvider={props.dataProvider}
      />

      <CallsModal
        templateId={selectedTemplateId}
        onClose={() => setShowTemplateCalls(false)}
        open={showTemplateCalls}
      />
      <TechnicalReviewsModal
        templateId={selectedTemplateId}
        onClose={() => setShowTemplateTechnicalReviews(false)}
        open={showTemplateTechnicalReviews}
      />
    </>
  );
}

export default TechnicalReviewTemplatesTable;
