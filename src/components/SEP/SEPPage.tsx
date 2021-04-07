import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import React from 'react';
import { useParams } from 'react-router';

import { useCheckAccess } from 'components/common/Can';
import SimpleTabs from 'components/common/TabPanel';
import UOLoader from 'components/common/UOLoader';
import EventLogList from 'components/eventLog/EventLogList';
import { Sep, UserRole } from 'generated/sdk';
import { useSEPData } from 'hooks/SEP/useSEPData';
import { StyledPaper } from 'styles/StyledComponents';

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
      <Container maxWidth="lg">
        <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />
      </Container>
    );
  }

  if (!sep) {
    return (
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>SEP not found</StyledPaper>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={tabNames}>
        <SEPGeneralInfo
          data={sep}
          onSEPUpdate={(newSEP: Sep): void => setSEP(newSEP)}
        />
        <SEPMembers
          data={sep}
          sepId={sep.id}
          onSEPUpdate={(newSEP: Sep): void => setSEP(newSEP)}
        />
        <SEPProposalsAndAssignmentsView sepId={sep.id} />
        <SEPMeetingComponentsView sepId={sep.id} />
        {hasAccessRights && (
          <EventLogList changedObjectId={sep.id} eventType="SEP" />
        )}
      </SimpleTabs>
    </Container>
  );
};

export default SEPPage;
