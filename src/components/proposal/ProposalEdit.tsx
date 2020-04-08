import React from 'react';
import { useParams } from 'react-router';

import { useProposalData } from '../../hooks/useProposalData';
import ProposalContainer from './ProposalContainer';

export default function ProposalEdit() {
  const { proposalID } = useParams();

  const { proposalData } = useProposalData(parseInt(proposalID!));

  if (!proposalData) {
    return <p>Loading</p>;
  }

  return <ProposalContainer data={proposalData!} />;
}
