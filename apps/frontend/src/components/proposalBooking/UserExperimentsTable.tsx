import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

export default function UserExperimentTimesTable() {
  // const { loading, proposalScheduledEvents } =
  //   useProposalBookingsScheduledEvents({
  //     notDraft: true,
  //   });

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        {/* <ExperimentsTable
          isLoading={loading}
          proposalScheduledEvents={proposalScheduledEvents}
          title="Experiment Times"
          options={{
            search: true,
            padding: 'default',
            emptyRowsWhenPaging: true,
            paging: true,
          }}
        /> */}
      </StyledPaper>
    </StyledContainer>
  );
}
