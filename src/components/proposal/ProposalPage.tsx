import Grid from '@material-ui/core/Grid';
import { Options, MTableToolbar } from 'material-table';
import React from 'react';

import { ProposalsFilter } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalFilterBar from './ProposalFilterBar';
import ProposalTableOfficer from './ProposalTableOfficer';

export default function ProposalPage() {
  const [proposalFilter, setProposalFilter] = React.useState<ProposalsFilter>(
    {}
  );
  const { loading, callsData } = useCallsData();
  const { loadingInstruments, instrumentsData } = useInstrumentsData();

  const Toolbar = (data: Options): JSX.Element =>
    loading || loadingInstruments ? (
      <div>Loading...</div>
    ) : (
      <>
        <MTableToolbar {...data} />
        <ProposalFilterBar
          callsData={callsData}
          instrumentsData={instrumentsData}
          onChange={setProposalFilter}
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
                Toolbar={Toolbar}
              />
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </>
  );
}
