import { Switch, FormControlLabel } from '@material-ui/core';
import React, { HTMLAttributes, useState } from 'react';

import { Proposal } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import ProposalQuestionaryReview from '../review/ProposalQuestionaryReview';
import ProposalContainer from './ProposalContainer';

export default function GeneralInformation(
  props: HTMLAttributes<any> & {
    data: Proposal;
    onProposalChanged?: (newProposal: Proposal) => void;
  }
) {
  const [isEditable, setIsEditable] = useState(false);
  const [proposal, setProposal] = useState(props.data);
  const api = useDataApi();

  const readonlyView = <ProposalQuestionaryReview data={proposal} />;
  const editableView = <ProposalContainer data={proposal} />;

  return (
    <div>
      <FormControlLabel
        style={{ display: 'block', textAlign: 'right' }}
        control={
          <Switch
            checked={isEditable}
            onChange={() => {
              api()
                .getProposal({ id: proposal.id })
                .then(data => {
                  const { proposal } = data;
                  setProposal(proposal!);
                  props.onProposalChanged && props.onProposalChanged(proposal!);
                });
              setIsEditable(!isEditable);
            }}
            color="primary"
          />
        }
        label={isEditable ? 'Close' : 'Edit proposal'}
      />
      {isEditable ? editableView : readonlyView}
    </div>
  );
}
