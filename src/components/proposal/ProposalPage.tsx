import Grid from '@material-ui/core/Grid';
import React from 'react';
import {
  NumberParam,
  useQueryParams,
  StringParam,
  withDefault,
  DelimitedNumericArrayParam,
  QueryParamConfig,
} from 'use-query-params';

import { ProposalsFilter } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalFilterBar from './ProposalFilterBar';
import ProposalTableOfficer from './ProposalTableOfficer';

export type ProposalPageQueryParamsType = {
  call: QueryParamConfig<number | null | undefined>;
  instrument: QueryParamConfig<number | null | undefined>;
  search: QueryParamConfig<string | null | undefined>;
  selection: QueryParamConfig<(number | null | never)[]>;
};

export default function ProposalPage() {
  const [query, setQuery] = useQueryParams<ProposalPageQueryParamsType>({
    call: NumberParam,
    instrument: NumberParam,
    search: StringParam,
    selection: withDefault(DelimitedNumericArrayParam, []),
  });
  const [proposalFilter, setProposalFilter] = React.useState<ProposalsFilter>({
    callId: query.call,
    instrumentId: query.instrument,
  });
  const { loadingCalls, callsData } = useCallsData();
  const { loadingInstruments, instrumentsData } = useInstrumentsData();

  const ProposalToolbar = (): JSX.Element =>
    loadingCalls || loadingInstruments ? (
      <div>Loading filters...</div>
    ) : (
      <>
        <ProposalFilterBar
          callsData={callsData}
          instrumentsData={instrumentsData}
          setProposalFilter={setProposalFilter}
          filter={proposalFilter}
        />
      </>
    );

  return (
    <>
      <ContentContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>
              <ProposalToolbar />
              <ProposalTableOfficer
                proposalFilter={proposalFilter}
                query={query}
                setQuery={setQuery}
              />
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </>
  );
}
