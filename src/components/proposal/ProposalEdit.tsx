import React from 'react';

import { useProposalData } from '../../hooks/useProposalData';
import ProposalContainer from './ProposalContainer';

export default function ProposalEdit(props: { match: any }): JSX.Element {
  const { proposalData } = useProposalData(
    parseInt(props.match.params.proposalID)
  );

  if (!proposalData) {
    return <p>Loading</p>;
  }

  return <ProposalContainer data={proposalData!} />;
}
