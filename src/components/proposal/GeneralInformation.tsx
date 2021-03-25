import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Switch from '@material-ui/core/Switch';
import React, { useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import ProposalQuestionaryReview from 'components/review/ProposalQuestionaryReview';
import { Proposal, UserRole } from 'generated/sdk';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';

import ProposalContainer from './ProposalContainer';

const useStyles = makeStyles((theme) => ({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: '20px',
    backgroundColor: theme.palette.secondary.main,
    color: '#ffff',
    '&:hover': {
      backgroundColor: theme.palette.secondary.light,
    },
  },
}));

type GeneralInformationProps = {
  data: Proposal;
  onProposalChanged?: (newProposal: Proposal) => void;
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
      <div className={classes.buttons}>
        <Button
          className={classes.button}
          onClick={() => downloadPDFProposal([data.id], data.title)}
          variant="contained"
        >
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default GeneralInformation;
