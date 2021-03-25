import Grid from '@material-ui/core/Grid';
import React from 'react';
import {
  NumberParam,
  QueryParamConfig,
  StringParam,
  useQueryParams,
} from 'use-query-params';

import {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { ProposalsFilter } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { useProposalStatusesData } from 'hooks/settings/useProposalStatusesData';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalFilterBar, {
  questionaryFilterFromUrlQuery,
} from './ProposalFilterBar';
import ProposalTableOfficer from './ProposalTableOfficer';

export type ProposalUrlQueryParamsType = {
  call: QueryParamConfig<number | null | undefined>;
  instrument: QueryParamConfig<number | null | undefined>;
  proposalStatus: QueryParamConfig<number | null | undefined>;
  reviewModal: QueryParamConfig<number | null | undefined>;
  compareOperator: QueryParamConfig<string | null | undefined>;
  questionId: QueryParamConfig<string | null | undefined>;
  value: QueryParamConfig<string | null | undefined>;
  dataType: QueryParamConfig<string | null | undefined>;
} & UrlQueryParamsType;

export default function ProposalPage() {
  const [
    urlQueryParams,
    setUrlQueryParams,
  ] = useQueryParams<ProposalUrlQueryParamsType>({
    ...DefaultQueryParams,
    call: NumberParam,
    instrument: NumberParam,
    proposalStatus: NumberParam,
    reviewModal: NumberParam,
    questionId: StringParam,
    compareOperator: StringParam,
    value: StringParam,
    dataType: StringParam,
  });
  const [proposalFilter, setProposalFilter] = React.useState<ProposalsFilter>({
    callId: urlQueryParams.call,
    instrumentId: urlQueryParams.instrument,
    proposalStatusId: urlQueryParams.proposalStatus,
    questionFilter: questionaryFilterFromUrlQuery(urlQueryParams),
  });
  const { calls, loadingCalls } = useCallsData();
  const { instruments, loadingInstruments } = useInstrumentsData();
  const {
    proposalStatuses,
    loadingProposalStatuses,
  } = useProposalStatusesData();

  return (
    <>
      <ContentContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper data-cy="officer-proposals-table">
              <ProposalFilterBar
                calls={{ data: calls, isLoading: loadingCalls }}
                instruments={{
                  data: instruments,
                  isLoading: loadingInstruments,
                }}
                proposalStatuses={{
                  data: proposalStatuses,
                  isLoading: loadingProposalStatuses,
                }}
                setProposalFilter={setProposalFilter}
                filter={proposalFilter}
              />
              <ProposalTableOfficer
                proposalFilter={proposalFilter}
                urlQueryParams={urlQueryParams}
                setUrlQueryParams={setUrlQueryParams}
              />
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </>
  );
}
