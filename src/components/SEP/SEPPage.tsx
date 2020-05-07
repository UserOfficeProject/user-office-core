import Container from '@material-ui/core/Container';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useCallback } from 'react';

import { Sep } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import SimpleTabs from '../common/TabPanel';
import EventLogList from '../eventLog/EventLogList';
import SEPAssignments from './SEPAssignments';
import SEPGeneralInfo from './SEPGeneralInfo';
import SEPMembers from './SEPMembers';

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

  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={['General', 'Members', 'Assignments', 'Logs']}>
        <SEPGeneralInfo
          data={sep}
          onSEPUpdate={(newSEP: Sep): void => setSEP(newSEP)}
        />
        <SEPMembers sepId={sep.id} />
        <SEPAssignments sepId={sep.id} />
        <EventLogList changedObjectId={sep.id} eventType="SEP" />
      </SimpleTabs>
    </Container>
  );
};

SEPPage.propTypes = SEPPagePropTypes;

export default SEPPage;
