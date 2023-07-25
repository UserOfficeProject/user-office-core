import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import React, { useContext } from 'react';

import UOLoader from 'components/common/UOLoader';
import ProposalContainer from 'components/proposal/ProposalContainer';
import { createProposalStub } from 'components/proposal/ProposalCreate';
import { UserContext } from 'context/UserContextProvider';
import { BasicUserDetails } from 'generated/sdk';
import { useBlankQuestionaryStepsData } from 'hooks/questionary/useBlankQuestionaryStepsData';

type PreviewTemplateModalProps = {
  templateId: number | null;
  setTemplateId: React.Dispatch<React.SetStateAction<number | null>>;
};

const PreviewTemplateModal = ({
  templateId,
  setTemplateId,
}: PreviewTemplateModalProps) => {
  const { user } = useContext(UserContext);

  const { questionarySteps, loading } =
    useBlankQuestionaryStepsData(templateId);

  if (!questionarySteps?.length || !templateId) {
    return null;
  }

  return (
    <Dialog
      aria-labelledby="preview-questionary-template-modal"
      aria-describedby="preview-questionary-template-modal"
      open={templateId !== null}
      onClose={() => setTemplateId(null)}
      style={{ backdropFilter: 'blur(6px)' }}
      maxWidth="md"
      fullWidth
    >
      <DialogContent>
        {loading ? (
          <UOLoader />
        ) : (
          <ProposalContainer
            proposal={createProposalStub(
              templateId,
              questionarySteps,
              user as unknown as BasicUserDetails
            )}
            previewMode={true}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="text"
          onClick={() => setTemplateId(null)}
          data-cy="close-modal"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreviewTemplateModal;
