import parse from 'html-react-parser';
import React, { useContext } from 'react';

import ProposalTableInstrumentScientist from 'components/proposal/ProposalTableInstrumentScientist';
import ProposalTableOfficer from 'components/proposal/ProposalTableOfficer';
import ProposalTableReader from 'components/proposal/ProposalTableReader';
import ProposalTableUser from 'components/proposal/ProposalTableUser';
import UserUpcomingExperimentsTable from 'components/proposalBooking/UserUpcomingExperimentsTable';
import ProposalTableReviewer from 'components/review/ProposalTableReviewer';
import { FeatureContext } from 'context/FeatureContextProvider';
import { PageName, UserRole, FeatureId } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

const Paper = ({ children }: { children: React.ReactNode }) => (
  <StyledPaper
    margin={[0, 0, 2, 0]}
    sx={{
      '&:empty': {
        display: 'none',
      },
    }}
  >
    {children}
  </StyledPaper>
);

export default function OverviewPage(props: { userRole: UserRole }) {
  const [loadingContent, pageContent] = useGetPageContent(
    props.userRole === UserRole.USER ? PageName.HOMEPAGE : PageName.REVIEWPAGE
  );
  const { featuresMap } = useContext(FeatureContext);
  const isSchedulerEnabled = featuresMap.get(FeatureId.SCHEDULER)?.isEnabled;

  let roleBasedOverView = null;

  switch (props.userRole) {
    case UserRole.USER:
      roleBasedOverView = (
        <>
          {isSchedulerEnabled && (
            <Paper>
              <UserUpcomingExperimentsTable />
            </Paper>
          )}
          <Paper>
            <ProposalTableUser />
          </Paper>
        </>
      );
      break;
    case UserRole.INSTRUMENT_SCIENTIST:
    case UserRole.INTERNAL_REVIEWER:
      roleBasedOverView = (
        <Paper>
          <ProposalTableInstrumentScientist />
        </Paper>
      );
      break;
    case UserRole.EXPERIMENT_SAFETY_REVIEWER:
    case UserRole.FAP_CHAIR:
    case UserRole.FAP_REVIEWER:
    case UserRole.FAP_SECRETARY:
      roleBasedOverView = (
        <Paper>
          <ProposalTableReviewer />
        </Paper>
      );
      break;
    case UserRole.PROPOSAL_READER:
      roleBasedOverView = (
        <Paper>
          <ProposalTableReader />
        </Paper>
      );
      break;
    default:
      roleBasedOverView = (
        <Paper>
          <ProposalTableOfficer
            proposalFilter={{}}
            setProposalFilter={function (): void {
              throw new Error('Function not implemented.');
            }}
          />
        </Paper>
      );
      break;
  }

  return (
    <StyledContainer maxWidth={false}>
      {props.userRole !== UserRole.INSTRUMENT_SCIENTIST &&
        props.userRole !== UserRole.PROPOSAL_READER &&
        Object.values(UserRole).includes(props.userRole) && (
          <Paper>
            {loadingContent ? (
              <div>Loading...</div>
            ) : (
              parse(pageContent as string)
            )}
          </Paper>
        )}
      {roleBasedOverView}
    </StyledContainer>
  );
}
