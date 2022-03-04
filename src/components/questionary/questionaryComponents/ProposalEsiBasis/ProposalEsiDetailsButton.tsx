import React from 'react';

import ProposalEsiDetails from 'components/proposalEsi/ProposalEsiDetails';
import ButtonWithDialog from 'hooks/common/ButtonWithDialog';

interface ProposalEsiDetailsButtonProps {
  esiId: number;
}
function ProposalEsiDetailsButton(props: ProposalEsiDetailsButtonProps) {
  return (
    <ButtonWithDialog label="Experiment safety form">
      <ProposalEsiDetails esiId={props.esiId} />
    </ButtonWithDialog>
  );
}

export default ProposalEsiDetailsButton;
