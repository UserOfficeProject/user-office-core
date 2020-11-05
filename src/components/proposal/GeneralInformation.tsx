import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import React, { HTMLAttributes, useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import ProposalQuestionaryReview from 'components/review/ProposalQuestionaryReview';
import { Proposal, UserRole } from 'generated/sdk';

import ProposalContainer from './ProposalContainer';

export default function GeneralInformation(
  props: HTMLAttributes<any> & {
    data: Proposal;
    onProposalChanged?: (newProposal: Proposal) => void;
  }
) {
  const [isEditable, setIsEditable] = useState(false);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const getReadonlyView = () => <ProposalQuestionaryReview data={props.data} />;
  const getEditableView = () => (
    <ProposalContainer
      proposal={props.data}
      proposalUpdated={props.onProposalChanged}
    />
  );

  return (
    <div>
      {isUserOfficer && (
        <FormControlLabel
          style={{ display: 'block', textAlign: 'right' }}
          control={
            <Switch
              checked={isEditable}
              onChange={() => {
                setIsEditable(!isEditable);
              }}
              color="primary"
            />
          }
          label={isEditable ? 'Close' : 'Edit proposal'}
        />
      )}
      {isEditable ? getEditableView() : getReadonlyView()}
    </div>
  );
}
