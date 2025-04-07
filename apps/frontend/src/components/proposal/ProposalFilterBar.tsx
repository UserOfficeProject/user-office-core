import Grid from '@mui/material/Grid';
import React from 'react';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import ProposalStatusFilter from 'components/common/proposalFilters/ProposalStatusFilter';
import QuestionaryFilter from 'components/common/proposalFilters/QuestionaryFilter';
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
  proposalStatuses?: { data: Status[]; isLoading: boolean };
  setProposalFilter: (filter: ProposalsFilter) => void;
  filter: ProposalsFilter;
  hiddenStatuses: number[];
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
      <Grid item sm={4} xs={12}>
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

      <Grid item sm={4} xs={12}>
        <InstrumentFilter
          instrumentId={filter.instrumentFilter?.instrumentId}
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

      <Grid item sm={4} xs={12}>
        <ProposalStatusFilter
          proposalStatusId={filter.proposalStatusId as number}
          proposalStatuses={proposalStatuses?.data}
          isLoading={proposalStatuses?.isLoading}
          shouldShowAll={true}
          hiddenStatuses={filter.excludeProposalStatusIds as number[]}
          onChange={(proposalStatusId) => {
            setProposalFilter({
              ...filter,
              proposalStatusId,
            });
          }}
        />
      </Grid>

      {selectedCallTemplateId && (
        <Grid item sm={8} xs={12} style={{ paddingTop: 0 }}>
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
