import Grid from '@mui/material/Grid';
import React from 'react';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter, {
  getInstrumentFilterIds,
} from 'components/common/proposalFilters/InstrumentFilter';
import QuestionaryFilter from 'components/common/proposalFilters/QuestionaryFilter';
import ProposalStatusFilter from 'components/common/proposalFilters/StatusFilter';
import {
  Call,
  DataType,
  InstrumentMinimalFragment,
  ProposalsFilter,
  QuestionFilterCompareOperator,
  QuestionFilterInput,
  Status,
} from 'generated/sdk';

export const questionaryFilterFromUrlQuery = (urlQuery: {
  questionId: string | null;
  compareOperator: string | null;
  value: string | null;
  dataType: string | null;
}): QuestionFilterInput | undefined => {
  if (
    urlQuery.questionId &&
    urlQuery.compareOperator &&
    urlQuery.value &&
    urlQuery.dataType
  ) {
    return {
      questionId: urlQuery.questionId,
      compareOperator:
        urlQuery.compareOperator as QuestionFilterCompareOperator,
      value: urlQuery.value,
      dataType: urlQuery.dataType as DataType,
    };
  }
};
type ProposalFilterBarProps = {
  calls?: {
    data: Pick<Call, 'shortCode' | 'id' | 'templateId'>[];
    isLoading: boolean;
  };
  instruments?: { data: InstrumentMinimalFragment[]; isLoading: boolean };
  tags?: {
    data: { id: number; name: string; shortCode: string }[];
    isLoading: boolean;
  };
  proposalStatuses?: { data: Status[]; isLoading: boolean };
  setProposalFilter: (filter: ProposalsFilter) => void;
  filter: ProposalsFilter;
  hiddenStatuses: string[];
};

const ProposalFilterBar = ({
  calls,
  instruments,
  proposalStatuses,
  setProposalFilter,
  filter,
}: ProposalFilterBarProps) => {
  const selectedCallTemplateId = calls?.data.find(
    (call) => call.id === filter.callId
  )?.templateId;

  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          sm: 4,
          xs: 12
        }}>
        <CallFilter
          callId={filter.callId as number}
          calls={calls?.data}
          isLoading={calls?.isLoading}
          shouldShowAll={true}
          onChange={(callId) => {
            setProposalFilter({
              ...filter,
              callId,
            });
          }}
        />
      </Grid>
      <Grid
        size={{
          sm: 4,
          xs: 12
        }}>
        <InstrumentFilter
          instrumentIds={getInstrumentFilterIds(filter.instrumentFilter)}
          showMultiInstrumentProposals={
            filter.instrumentFilter?.showMultiInstrumentProposals
          }
          instruments={instruments?.data}
          isLoading={instruments?.isLoading}
          shouldShowAll={true}
          shouldShowMultiple={true}
          onChange={(instrumentFilterValue) => {
            setProposalFilter({
              ...filter,
              instrumentFilter: instrumentFilterValue,
            });
          }}
        />
      </Grid>
      <Grid
        size={{
          sm: 4,
          xs: 12
        }}>
        <ProposalStatusFilter
          statusId={filter.proposalStatusId as string}
          statuses={proposalStatuses?.data}
          isLoading={proposalStatuses?.isLoading}
          shouldShowAll={true}
          hiddenStatuses={filter.excludeProposalStatusIds as string[]}
          onChange={(proposalStatusId) => {
            setProposalFilter({
              ...filter,
              proposalStatusId,
            });
          }}
        />
      </Grid>
      {selectedCallTemplateId && (
        <Grid
          style={{ paddingTop: 0 }}
          size={{
            sm: 8,
            xs: 12
          }}>
          <QuestionaryFilter
            callId={filter.callId}
            templateId={selectedCallTemplateId}
            onSubmit={(questionFilter) => {
              setProposalFilter({
                ...filter,
                questionFilter,
              });
            }}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default ProposalFilterBar;
