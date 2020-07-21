import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';
import React from 'react';
import { useParams } from 'react-router';

import SimpleTabs from 'components/common/TabPanel';
import { useProposalData } from 'hooks/proposal/useProposalData';

import ProposalContainer from './ProposalContainer';

export default function ProposalEdit() {
  const { proposalID } = useParams();

  const { proposalData } = useProposalData(+proposalID);

  if (!proposalData) {
    return (
      <CircularProgress style={{ marginLeft: '50%', marginTop: '100px' }} />
    );
  }
  if (proposalData.notified) {
    return (
      <SimpleTabs tabNames={['Comment', 'Proposal']}>
        <>
          <p>
            Decision: {getTranslation(proposalData.finalStatus as ResourceId)}
          </p>
          <p>Comment: {proposalData.commentForUser}</p>
        </>
        <ProposalContainer data={proposalData} />
      </SimpleTabs>
    );
  }

  return <ProposalContainer data={proposalData} />;
}
