import { Switch, FormControlLabel } from '@material-ui/core';
import React, { HTMLAttributes, useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import ProposalQuestionaryReview from 'components/review/ProposalQuestionaryReview';
import { Proposal, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

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
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const readonlyView = <ProposalQuestionaryReview data={proposal} />;
  const editableView = <ProposalContainer data={proposal} />;

  return (
    <div>
      {isUserOfficer && (
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
                    setProposal(proposal as Proposal);
                    props.onProposalChanged &&
                      props.onProposalChanged(proposal as Proposal);
                  });
                setIsEditable(!isEditable);
              }}
              color="primary"
            />
          }
          label={isEditable ? 'Close' : 'Edit proposal'}
        />
      )}
      {isEditable ? editableView : readonlyView}
    </div>
  );
}
