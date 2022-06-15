import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import makeStyles from '@mui/styles/makeStyles';
import React, { useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import ProposalQuestionaryReview from 'components/review/ProposalQuestionaryReview';
import { UserRole } from 'generated/sdk';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { ProposalWithQuestionary } from 'models/questionary/proposal/ProposalWithQuestionary';

import ProposalContainer from './ProposalContainer';

const useStyles = makeStyles(() => ({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: '20px',
  },
}));

type GeneralInformationProps = {
  data: ProposalWithQuestionary;
  onProposalChanged?: (newProposal: ProposalWithQuestionary) => void;
};

const GeneralInformation: React.FC<GeneralInformationProps> = ({
  data,
  onProposalChanged,
}) => {
  const [isEditable, setIsEditable] = useState(false);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const classes = useStyles();
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
        <div className={classes.buttons}>
          <Button
            className={classes.button}
            onClick={() => downloadPDFProposal([data.primaryKey], data.title)}
          >
            Download PDF
          </Button>
        </div>
      )}
    </div>
  );
};

export default GeneralInformation;
