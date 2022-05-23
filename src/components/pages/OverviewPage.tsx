import parse from 'html-react-parser';
import React, { useContext } from 'react';

import ProposalTableInstrumentScientist from 'components/proposal/ProposalTableInstrumentScientist';
import ProposalTableUser from 'components/proposal/ProposalTableUser';
import UserUpcomingExperimentsTable from 'components/proposalBooking/UserUpcomingExperimentsTable';
import ProposalTableReviewer from 'components/review/ProposalTableReviewer';
import { FeatureContext } from 'context/FeatureContextProvider';
import { PageName, UserRole, FeatureId } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

const PaperContainer: React.FC = ({ children }) => (
  <StyledPaper>{children}</StyledPaper>
);

export default function OverviewPage(props: { userRole: UserRole }) {
  const [loadingContent, pageContent] = useGetPageContent(
    props.userRole === UserRole.USER ? PageName.HOMEPAGE : PageName.REVIEWPAGE
  );
  const { featuresMap } = useContext(FeatureContext);
  const isSchedulerEnabled = featuresMap.get(FeatureId.SCHEDULER)?.isEnabled;

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
    <StyledContainer>
      {props.userRole !== UserRole.INSTRUMENT_SCIENTIST && (
        <StyledPaper margin={[0, 0, 2, 0]}>
          {loadingContent ? (
            <div>Loading...</div>
          ) : (
            parse(pageContent as string)
          )}
        </StyledPaper>
      )}
      {roleBasedOverView}
    </StyledContainer>
  );
}
