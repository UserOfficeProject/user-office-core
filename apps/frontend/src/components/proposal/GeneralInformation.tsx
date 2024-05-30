import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import React, { useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import ProposalQuestionaryReview from 'components/review/ProposalQuestionaryReview';
import { UserRole } from 'generated/sdk';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { ProposalWithQuestionary } from 'models/questionary/proposal/ProposalWithQuestionary';

import ProposalContainer from './ProposalContainer';

type GeneralInformationProps = {
  data: ProposalWithQuestionary;
  onProposalChanged?: (newProposal: ProposalWithQuestionary) => void;
};

const GeneralInformation = ({
  data,
  onProposalChanged,
}: GeneralInformationProps) => {
  const [isEditable, setIsEditable] = useState(false);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const downloadPDFProposal = useDownloadPDFProposal();

  const getReadonlyView = () => <ProposalQuestionaryReview data={data} />;
  const getEditableView = () => (
    <ProposalContainer proposal={data} proposalUpdated={onProposalChanged} />
  );

  return (
    <div>
      {isUserOfficer && (
        <FormControlLabel
          style={{ display: 'block', textAlign: 'right' }}
          control={
            <Switch
              checked={isEditable}
              data-cy="toggle-edit-proposal"
              onChange={() => {
                setIsEditable(!isEditable);
              }}
            />
          }
          label={isEditable ? 'Close' : 'Edit proposal'}
        />
      )}
      {isEditable ? getEditableView() : getReadonlyView()}
      {!isEditable && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            sx={{
              marginTop: '20px',
            }}
            onClick={() => downloadPDFProposal([data.primaryKey], data.title)}
          >
            Download PDF
          </Button>
        </Box>
      )}
    </div>
  );
};

export default GeneralInformation;
