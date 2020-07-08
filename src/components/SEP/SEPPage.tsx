import Container from '@material-ui/core/Container';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useCallback } from 'react';

import { Sep, UserRole } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useCheckAccess } from '../common/Can';
import SimpleTabs from '../common/TabPanel';
import EventLogList from '../eventLog/EventLogList';
import SEPGeneralInfo from './General/SEPGeneralInfo';
import SEPMeetingComponents from './MeetingComponents/SEPMeetingComponents';
import SEPMembers from './Members/SEPMembers';
import SEPProposalsAndAssignments from './Proposals/SEPProposalsAndAssignments';

const SEPPagePropTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

type SEPPageProps = PropTypes.InferProps<typeof SEPPagePropTypes>;

const SEPPage: React.FC<SEPPageProps> = ({ match }) => {
  const [sep, setSEP] = useState<Sep | null>(null);
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

  if (!sep) {
    return <p>Loading...</p>;
  }

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
      <SimpleTabs tabNames={tabNames}>
        <SEPGeneralInfo
          data={sep}
          onSEPUpdate={(newSEP: Sep): void => setSEP(newSEP)}
        />
        <SEPMembers sepId={sep.id} />
        <SEPProposalsAndAssignments sepId={sep.id} />
        <SEPMeetingComponents sepId={sep.id} />
        {hasAccessRights && (
          <EventLogList changedObjectId={sep.id} eventType="SEP" />
        )}
      </SimpleTabs>
    </Container>
  );
};

SEPPage.propTypes = SEPPagePropTypes;

export default SEPPage;
