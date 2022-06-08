import React from 'react';
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

const SEPPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { loading, sep, setSEP } = useSEPData(parseInt(id));
  const hasAccessRights = useCheckAccess([UserRole.USER_OFFICER]);

  const tabNames = [
    'General',
    'Members',
    'Proposals and Assignments',
    'Meeting Components',
  ];

  if (hasAccessRights) {
    tabNames.push('Logs');
  }

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
        <StyledPaper>SEP not found</StyledPaper>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth="xl">
      <StyledPaper>
        <SimpleTabs tabNames={tabNames}>
          <SEPGeneralInfo
            data={sep}
            onSEPUpdate={(newSEP: Sep): void => setSEP(newSEP)}
          />
          <SEPMembers
            data={sep}
            onSEPUpdate={(newSEP: Sep): void => setSEP(newSEP)}
          />
          <SEPProposalsAndAssignmentsView
            data={sep}
            onSEPUpdate={(newSEP: Sep): void => setSEP(newSEP)}
          />
          <SEPMeetingComponentsView sepId={sep.id} />
          {hasAccessRights && (
            <EventLogList changedObjectId={sep.id} eventType="SEP" />
          )}
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
};

export default SEPPage;
