import Grid from '@material-ui/core/Grid';
import React, { Suspense } from 'react';
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
import { useProposalStatusesData } from 'hooks/settings/useProposalStatusesData';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalTableOfficer from './ProposalTableOfficer';

const ProposalFilterBar = React.lazy(() => import('./ProposalFilterBar'));

export type ProposalUrlQueryParamsType = {
  call: QueryParamConfig<number | null | undefined>;
  instrument: QueryParamConfig<number | null | undefined>;
  proposalStatus: QueryParamConfig<number | null | undefined>;
} & UrlQueryParamsType;

export default function ProposalPage() {
  const [urlQueryParams, setUrlQueryParams] = useQueryParams<
    ProposalUrlQueryParamsType
  >({
    call: NumberParam,
    instrument: NumberParam,
    proposalStatus: NumberParam,
    search: StringParam,
    selection: withDefault(DelimitedNumericArrayParam, []),
  });
  const [proposalFilter, setProposalFilter] = React.useState<ProposalsFilter>({
    callId: urlQueryParams.call,
    instrumentId: urlQueryParams.instrument,
    proposalStatusId: urlQueryParams.proposalStatus,
  });
  const { calls } = useCallsData();
  const { instruments } = useInstrumentsData();
  const { proposalStatuses } = useProposalStatusesData();

  const ProposalToolbar = (): JSX.Element => (
    <Suspense fallback={<div>Loading filters...</div>}>
      <ProposalFilterBar
        calls={calls}
        instruments={instruments}
        proposalStatuses={proposalStatuses}
        setProposalFilter={setProposalFilter}
        filter={proposalFilter}
      />
    </Suspense>
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
