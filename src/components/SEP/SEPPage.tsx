import Container from '@material-ui/core/Container';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useCallback, useContext } from 'react';

import { UserContext } from '../../context/UserContextProvider';
import { Sep } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import SimpleTabs from '../common/TabPanel';
import EventLogList from '../eventLog/EventLogList';
import SEPGeneralInfo from './SEPGeneralInfo';
import SEPMembers from './SEPMembers';
import SEPProposalsAndAssignments from './SEPProposalsAndAssignments';

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
  const { currentRole } = useContext(UserContext);
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

  const tabNames = ['General', 'Members', 'Proposals and Assignments'];

  if (currentRole === 'user_officer') {
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
        {currentRole === 'user_officer' && (
          <EventLogList changedObjectId={sep.id} eventType="SEP" />
        )}
      </SimpleTabs>
    </Container>
  );
};

SEPPage.propTypes = SEPPagePropTypes;

export default SEPPage;
