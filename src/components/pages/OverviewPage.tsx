import Grid from '@material-ui/core/Grid';
import parse from 'html-react-parser';
import React, { useContext } from 'react';

import ProposalTableInstrumentScientist from 'components/proposal/ProposalTableInstrumentScientist';
import ProposalTableUser from 'components/proposal/ProposalTableUser';
import UserUpcomingExperimentsTable from 'components/proposalBooking/UserUpcomingExperimentsTable';
import ProposalTableReviewer from 'components/review/ProposalTableReviewer';
import { FeatureContext } from 'context/FeatureContextProvider';
import { PageName, UserRole, FeatureId } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

const PaperContainer: React.FC = ({ children }) => (
  <Grid item xs={12}>
    <StyledPaper margin={[0]}>{children}</StyledPaper>
  </Grid>
);

export default function OverviewPage(props: { userRole: UserRole }) {
  const [loadingContent, pageContent] = useGetPageContent(
    props.userRole === UserRole.USER ? PageName.HOMEPAGE : PageName.REVIEWPAGE
  );
  const { features } = useContext(FeatureContext);
  const isSchedulerEnabled = features.get(FeatureId.SCHEDULER)?.isEnabled;

  let roleBasedOverView = (
    <PaperContainer>
      <ProposalTableReviewer />
    </PaperContainer>
  );

  switch (props.userRole) {
    case UserRole.USER:
      roleBasedOverView = (
        <>
          {isSchedulerEnabled && <UserUpcomingExperimentsTable />}
          <PaperContainer>
            <ProposalTableUser />
          </PaperContainer>
        </>
      );
      break;
    case UserRole.INSTRUMENT_SCIENTIST:
      roleBasedOverView = (
        <PaperContainer>
          <ProposalTableInstrumentScientist />
        </PaperContainer>
      );
      break;
  }

  return (
    <ContentContainer>
      <Grid container spacing={3}>
        {props.userRole !== UserRole.INSTRUMENT_SCIENTIST && (
          <Grid item xs={12}>
            <StyledPaper margin={[0]}>
              {loadingContent ? (
                <div>Loading...</div>
              ) : (
                parse(pageContent as string)
              )}
            </StyledPaper>
          </Grid>
        )}
        {roleBasedOverView}
      </Grid>
    </ContentContainer>
  );
}
