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

import { UrlQueryParamsType } from 'components/common/SuperMaterialTable';
import { ProposalsFilter } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalFilterBar from './ProposalFilterBar';
import ProposalTableOfficer from './ProposalTableOfficer';

export type ProposalUrlQueryParamsType = {
  call: QueryParamConfig<number | null | undefined>;
  instrument: QueryParamConfig<number | null | undefined>;
} & UrlQueryParamsType;

export default function ProposalPage() {
  const [urlQueryParams, setUrlQueryParams] = useQueryParams<
    ProposalUrlQueryParamsType
  >({
    call: NumberParam,
    instrument: NumberParam,
    search: StringParam,
    selection: withDefault(DelimitedNumericArrayParam, []),
  });
  const [proposalFilter, setProposalFilter] = React.useState<ProposalsFilter>({
    callId: urlQueryParams.call,
    instrumentId: urlQueryParams.instrument,
  });
  const { loadingCalls, calls } = useCallsData();
  const { loadingInstruments, instruments } = useInstrumentsData();

  const ProposalToolbar = (): JSX.Element =>
    loadingCalls || loadingInstruments ? (
      <div>Loading filters...</div>
    ) : (
      <>
        <ProposalFilterBar
          callsData={calls}
          instrumentsData={instruments}
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
