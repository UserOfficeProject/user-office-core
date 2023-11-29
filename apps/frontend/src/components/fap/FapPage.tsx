import React from 'react';
import { useParams } from 'react-router';

import { useCheckAccess } from 'components/common/Can';
import SimpleTabs from 'components/common/TabPanel';
import UOLoader from 'components/common/UOLoader';
import EventLogList from 'components/eventLog/EventLogList';
import { Fap, UserRole } from 'generated/sdk';
import { useFapData } from 'hooks/fap/useFapData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import FapGeneralInfo from './General/FapGeneralInfo';
import FapMeetingComponentsView from './MeetingComponents/FapMeetingComponentsView';
import FapMembers from './Members/FapMembers';
import FapProposalsAndAssignmentsView from './Proposals/FapProposalsAndAssignmentsView';

const FapPage = () => {
  const { id } = useParams<{ id: string }>();
  const { loading, fap, setFap } = useFapData(parseInt(id));
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const isFapChairOrSecretary = useCheckAccess([
    UserRole.FAP_CHAIR,
    UserRole.FAP_SECRETARY,
  ]);

  if (loading) {
    return (
      <StyledContainer>
        <StyledPaper>
          <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />
        </StyledPaper>
      </StyledContainer>
    );
  }

  if (!fap) {
    return (
      <StyledContainer>
        <StyledPaper>Fap not found</StyledPaper>
      </StyledContainer>
    );
  }

  let tabs = [
    {
      name: 'Proposals and Assignments',
      element: (
        <FapProposalsAndAssignmentsView
          data={fap}
          onFapUpdate={(newFap: Fap): void => setFap(newFap)}
        />
      ),
    },
  ];

  if (isFapChairOrSecretary || isUserOfficer) {
    tabs = [
      {
        name: 'General',
        element: (
          <FapGeneralInfo
            data={fap}
            onFapUpdate={(newFap: Fap): void => setFap(newFap)}
          />
        ),
      },
      {
        name: 'Members',
        element: (
          <FapMembers
            data={fap}
            onFapUpdate={(newFap: Fap): void => setFap(newFap)}
          />
        ),
      },
      {
        name: 'Proposals and Assignments',
        element: (
          <FapProposalsAndAssignmentsView
            data={fap}
            onFapUpdate={(newFap: Fap): void => setFap(newFap)}
          />
        ),
      },
      {
        name: 'Meeting Components',
        element: <FapMeetingComponentsView fapId={fap.id} />,
      },
    ];
  }

  if (isUserOfficer) {
    tabs.push({
      name: 'Logs',
      element: <EventLogList changedObjectId={fap.id} eventType="FAP" />,
    });
  }

  return (
    <StyledContainer maxWidth="xl">
      <StyledPaper>
        <SimpleTabs tabNames={tabs.map((tab) => tab.name)}>
          {tabs.map((tab, index) => (
            <React.Fragment key={index}>{tab.element}</React.Fragment>
          ))}
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
};

export default FapPage;
