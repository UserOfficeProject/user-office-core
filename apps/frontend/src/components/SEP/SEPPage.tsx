import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { useCheckAccess } from 'components/common/Can';
import SimpleTabs from 'components/common/TabPanel';
import UOLoader from 'components/common/UOLoader';
import EventLogList from 'components/eventLog/EventLogList';
import { Sep, UserRole } from 'generated/sdk';
import { useSEPData } from 'hooks/SEP/useSEPData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import SEPGeneralInfo from './General/SEPGeneralInfo';
import SEPMeetingComponentsView from './MeetingComponents/SEPMeetingComponentsView';
import SEPMembers from './Members/SEPMembers';
import SEPProposalsAndAssignmentsView from './Proposals/SEPProposalsAndAssignmentsView';

const SEPPage = () => {
  const { id } = useParams<{ id: string }>();
  const { loading, sep, setSEP } = useSEPData(parseInt(id));
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const { t } = useTranslation();
  const isSEPChairOrSecretary = useCheckAccess([
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
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

  if (!sep) {
    return (
      <StyledContainer>
        <StyledPaper>{`${t('SEP')} not found`}</StyledPaper>
      </StyledContainer>
    );
  }

  let tabs = [
    {
      name: 'Proposals and Assignments',
      element: (
        <SEPProposalsAndAssignmentsView
          data={sep}
          onSEPUpdate={(newSEP: Sep): void => setSEP(newSEP)}
        />
      ),
    },
  ];

  if (isSEPChairOrSecretary || isUserOfficer) {
    tabs = [
      {
        name: 'General',
        element: (
          <SEPGeneralInfo
            data={sep}
            onSEPUpdate={(newSEP: Sep): void => setSEP(newSEP)}
          />
        ),
      },
      {
        name: 'Members',
        element: (
          <SEPMembers
            data={sep}
            onSEPUpdate={(newSEP: Sep): void => setSEP(newSEP)}
          />
        ),
      },
      {
        name: 'Proposals and Assignments',
        element: (
          <SEPProposalsAndAssignmentsView
            data={sep}
            onSEPUpdate={(newSEP: Sep): void => setSEP(newSEP)}
          />
        ),
      },
      {
        name: 'Meeting Components',
        element: <SEPMeetingComponentsView sepId={sep.id} code={sep.code} />,
      },
    ];
  }

  if (isUserOfficer) {
    tabs.push({
      name: 'Logs',
      element: <EventLogList changedObjectId={sep.id} eventType="SEP" />,
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

export default SEPPage;
