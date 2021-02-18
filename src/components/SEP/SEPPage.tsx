import Container from '@material-ui/core/Container';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useCallback } from 'react';

import { useCheckAccess } from 'components/common/Can';
import SimpleTabs from 'components/common/TabPanel';
import UOLoader from 'components/common/UOLoader';
import EventLogList from 'components/eventLog/EventLogList';
import { Sep, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

import SEPGeneralInfo from './General/SEPGeneralInfo';
import SEPMeetingComponentsView from './MeetingComponents/SEPMeetingComponentsView';
import SEPMembers from './Members/SEPMembers';
import SEPProposalsAndAssignmentsView from './Proposals/SEPProposalsAndAssignmentsView';

const SEPPagePropTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

type SEPPageProps = PropTypes.InferProps<typeof SEPPagePropTypes>;

const SEPPage: React.FC<SEPPageProps> = ({ match }) => {
  const [sep, setSEP] = useState<Sep | null | undefined>(null);
  const api = useDataApi();
  const hasAccessRights = useCheckAccess([UserRole.USER_OFFICER]);
  const loadSEP = useCallback(async () => {
    return api()
      .getSEP({ id: parseInt(match.params.id) })
      .then(data => {
        setSEP(data.sep);
      });
  }, [api, match.params.id]);

  useEffect(() => {
    loadSEP();
  }, [loadSEP]);

  const tabNames = [
    'General',
    'Members',
    'Proposals and Assignments',
    'Meeting Components',
  ];

  if (hasAccessRights) {
    tabNames.push('Logs');
  }

  return (
    <Container maxWidth="lg">
      {sep ? (
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
      ) : (
        <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />
      )}
    </Container>
  );
};

SEPPage.propTypes = SEPPagePropTypes;

export default SEPPage;
