import EventIcon from '@mui/icons-material/Event';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
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
import { StyledContainer } from 'styles/StyledComponents';

import DashboardSections, {
  DashboardSection,
  Panel,
} from './DashboardSections';

const getSections = (
  userRole: UserRole,
  isSchedulerEnabled: boolean
): DashboardSection[] => {
  switch (userRole) {
    case UserRole.USER: {
      const experiments: DashboardSection = {
        id: 'experiments',
        label: 'Experiments',
        icon: <EventIcon />,
        render: ({ canHideWhenEmpty }) => (
          <UserUpcomingExperimentsTable hideIfEmpty={canHideWhenEmpty} />
        ),
      };
      const proposals: DashboardSection = {
        id: 'proposals',
        label: 'My proposals',
        icon: <FolderOpenIcon />,
        render: () => <ProposalTableUser />,
      };

      return isSchedulerEnabled ? [experiments, proposals] : [proposals];
    }
    case UserRole.INSTRUMENT_SCIENTIST:
    case UserRole.INTERNAL_REVIEWER:
      return [
        {
          id: 'proposals',
          render: () => <ProposalTableInstrumentScientist />,
        },
      ];
    case UserRole.EXPERIMENT_SAFETY_REVIEWER:
    case UserRole.FAP_CHAIR:
    case UserRole.FAP_REVIEWER:
    case UserRole.FAP_SECRETARY:
      return [
        {
          id: 'proposals',
          render: () => <ProposalTableReviewer />,
        },
      ];
    case UserRole.PROPOSAL_READER:
      return [
        {
          id: 'proposals',
          render: () => <ProposalTableReader />,
        },
      ];
    default:
      return [
        {
          id: 'proposals',
          render: () => (
            <ProposalTableOfficer
              proposalFilter={{}}
              setProposalFilter={function (): void {
                throw new Error('Function not implemented.');
              }}
            />
          ),
        },
      ];
  }
};

export default function OverviewPage(props: { userRole: UserRole }) {
  const [loadingContent, pageContent] = useGetPageContent(
    props.userRole === UserRole.USER ? PageName.HOMEPAGE : PageName.REVIEWPAGE
  );
  const { featuresMap } = useContext(FeatureContext);
  const isSchedulerEnabled = featuresMap.get(FeatureId.SCHEDULER)?.isEnabled;

  const showPageContent =
    props.userRole !== UserRole.INSTRUMENT_SCIENTIST &&
    props.userRole !== UserRole.PROPOSAL_READER &&
    Object.values(UserRole).includes(props.userRole);

  return (
    <StyledContainer maxWidth={false}>
      {showPageContent && (
        <Panel>
          {loadingContent ? (
            <div>Loading...</div>
          ) : (
            parse(pageContent as string)
          )}
        </Panel>
      )}
      <DashboardSections
        sections={getSections(props.userRole, !!isSchedulerEnabled)}
      />
    </StyledContainer>
  );
}
