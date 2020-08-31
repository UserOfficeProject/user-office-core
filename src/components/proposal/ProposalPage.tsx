import Grid from '@material-ui/core/Grid';
import React from 'react';
import { NumberParam, useQueryParams } from 'use-query-params';

import { ProposalsFilter } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalFilterBar from './ProposalFilterBar';
import ProposalTableOfficer from './ProposalTableOfficer';

export default function ProposalPage() {
  const [
    selectedInstrumentAndCall,
    setSelectedInstrumentAndCall,
  ] = useQueryParams({
    call: NumberParam,
    instrument: NumberParam,
  });
  const [proposalFilter, setProposalFilter] = React.useState<ProposalsFilter>({
    callId: selectedInstrumentAndCall.call,
    instrumentId: selectedInstrumentAndCall.instrument,
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
          onChange={(filter: ProposalsFilter) => {
            setSelectedInstrumentAndCall({
              instrument: filter.instrumentId ? filter.instrumentId : undefined,
              call: filter.callId ? filter.callId : undefined,
            });

            setProposalFilter(filter);
          }}
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
              <ProposalTableOfficer
                proposalFilter={proposalFilter}
                Toolbar={ProposalToolbar}
              />
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </>
  );
}
