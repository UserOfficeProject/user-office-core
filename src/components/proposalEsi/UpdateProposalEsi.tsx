import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { useEsi } from 'hooks/esi/useEsi';
import { ProposalEsiCore } from 'models/questionary/proposalEsi/ProposalEsiCore';

import ProposalEsiContainer from './ProposalEsiContainer';

interface UpdateProposalEsiProps {
  esiId: number;
  onUpdate?: (esi: ProposalEsiCore) => void;
  onSubmitted?: (esi: ProposalEsiCore) => void;
}

function UpdateProposalEsi({
  esiId,
  onUpdate,
  onSubmitted,
}: UpdateProposalEsiProps) {
  const { esi } = useEsi(esiId);

  if (!esi) {
    return <UOLoader />;
  }

  return (
    <ProposalEsiContainer
      esi={esi}
      onUpdate={onUpdate}
      onSubmitted={onSubmitted}
    />
  );
}

export default UpdateProposalEsi;
