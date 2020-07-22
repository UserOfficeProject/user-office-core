import React from 'react';
import { useParams } from 'react-router';

import UOLoader from 'components/common/UOLoader';
import { useBlankProposal } from 'hooks/proposal/useBlankProposal';

import ProposalContainer from './ProposalContainer';

export default function ProposalCreate() {
  const { callId } = useParams();
  const { proposal } = useBlankProposal(parseInt(callId as string));

  if (!proposal) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  return <ProposalContainer data={proposal} />;
}
