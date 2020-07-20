import React from 'react';
import { useParams } from 'react-router';

import { useBlankProposal } from 'hooks/proposal/useBlankProposal';

import ProposalContainer from './ProposalContainer';

export default function ProposalCreate() {
  const { callId } = useParams();
  const { proposal } = useBlankProposal(parseInt(callId as string));

  if (!proposal) {
    return <p>Loading </p>;
  }

  return <ProposalContainer data={proposal} />;
}
