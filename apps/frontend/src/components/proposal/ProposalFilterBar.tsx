import Grid from '@mui/material/Grid';
import React from 'react';
import { DecodedValueMap } from 'use-query-params';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import ProposalStatusFilter from 'components/common/proposalFilters/ProposalStatusFilter';
import QuestionaryFilter from 'components/common/proposalFilters/QuestionaryFilter';
import {
  Call,
  DataType,
  InstrumentFragment,
  ProposalsFilter,
  ProposalStatus,
  QuestionFilterCompareOperator,
  QuestionFilterInput,
} from 'generated/sdk';

import { ProposalUrlQueryParamsType } from './ProposalPage';

export const questionaryFilterFromUrlQuery = (
  urlQuery: DecodedValueMap<ProposalUrlQueryParamsType>
): QuestionFilterInput | undefined => {
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
  calls?: { data: Call[]; isLoading: boolean };
  instruments?: { data: InstrumentFragment[]; isLoading: boolean };
  proposalStatuses?: { data: ProposalStatus[]; isLoading: boolean };
  setProposalFilter: (filter: ProposalsFilter) => void;
  filter: ProposalsFilter;
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
