import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import SimpleTabs from 'components/common/SimpleTabs';
import UOLoader from 'components/common/UOLoader';
import EventLogList from 'components/eventLog/EventLogList';
import { Fap, UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useFapData } from 'hooks/fap/useFapData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import FapFiles from './Files/FapFilesUpload';
import FapFilesView from './Files/FapFilesView';
import FapGeneralInfo from './General/FapGeneralInfo';
import FapMeetingComponentsView from './MeetingComponents/FapMeetingComponentsView';
import FapMembers from './Members/FapMembers';
import FapProposalsAndAssignmentsView from './Proposals/FapProposalsAndAssignmentsView';

const FapPage = () => {
  const { id } = useParams();
  const { loading, fap, setFap } = useFapData(id);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const isFapChairOrSecretary = useCheckAccess([
    UserRole.FAP_CHAIR,
    UserRole.FAP_SECRETARY,
  ]);
  const { t } = useTranslation();

  if (loading) {
    return (
      <StyledContainer maxWidth={false}>
        <StyledPaper>
          <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />
        </StyledPaper>
      </StyledContainer>
    );
  }

  if (!fap) {
    return (
      <StyledContainer maxWidth={false}>
        <StyledPaper>{t('Fap')} not found</StyledPaper>
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
    {
      name: 'Documents',
      element: <FapFilesView data={fap} />,
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
        name: 'Documents',
        element: <FapFilesView data={fap} />,
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
        element: <FapMeetingComponentsView fapId={fap.id} code={fap.code} />,
      },
    ];
  }

  if (isUserOfficer) {
    tabs.push({
      name: 'Documents - Upload',
      element: (
        <FapFiles
          data={fap}
          onFapUpdate={(newFap: Fap): void => setFap(newFap)}
        />
      ),
    });
    tabs.push({
      name: 'Logs',
      element: <EventLogList changedObjectId={fap.id} eventType="FAP" />,
    });
  }

  return (
    <StyledContainer maxWidth={false}>
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
