import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import React, { useContext } from 'react';

import UOLoader from 'components/common/UOLoader';
import ProposalContainer from 'components/proposal/ProposalContainer';
import { createProposalStub } from 'components/proposal/ProposalCreate';
import ProposalEsiContainer from 'components/proposalEsi/ProposalEsiContainer';
import { createESIStub } from 'components/proposalEsi/ProposalEsiContainer';
import { GenericTemplateContainer } from 'components/questionary/questionaryComponents/GenericTemplate/GenericTemplateContainer';
import { createGenericTemplateStub } from 'components/questionary/questionaryComponents/GenericTemplate/QuestionaryComponentGenericTemplate';
import { createSampleStub } from 'components/questionary/questionaryComponents/SampleDeclaration/QuestionaryComponentSampleDeclaration';
import { SampleDeclarationContainer } from 'components/questionary/questionaryComponents/SampleDeclaration/SampleDeclarationContainer';
import ReviewQuestionary, {
  createFapReviewStub,
} from 'components/review/ReviewQuestionary';
import ShipmentContainer from 'components/shipments/ShipmentContainer';
import { UserContext } from 'context/UserContextProvider';
import { BasicUserDetails } from 'generated/sdk';
import { TemplateGroupId } from 'generated/sdk';
import { useBlankQuestionaryStepsData } from 'hooks/questionary/useBlankQuestionaryStepsData';
import { createShipmentStub } from 'hooks/shipment/useBlankShipment';

type PreviewTemplateModalProps = {
  templateId: number | null;
  templateGroupId: TemplateGroupId | null;
  setTemplateId: React.Dispatch<React.SetStateAction<number | null>>;
};

const PreviewTemplateModal = ({
  templateId,
  setTemplateId,
  templateGroupId,
}: PreviewTemplateModalProps) => {
  const { user } = useContext(UserContext);

  const { questionarySteps, loading } =
    useBlankQuestionaryStepsData(templateId);

  const renderPreviewComponent = (templateGroupId: TemplateGroupId | null) => {
    if (!questionarySteps?.length || !templateId) {
      return null;
    }

    switch (templateGroupId) {
      case TemplateGroupId.PROPOSAL_ESI:
        return (
          <ProposalEsiContainer
            esi={createESIStub(templateId, questionarySteps)}
            previewMode={true}
          />
        );
      case TemplateGroupId.PROPOSAL:
        return (
          <ProposalContainer
            proposal={createProposalStub(
              templateId,
              questionarySteps,
              user as unknown as BasicUserDetails
            )}
            previewMode={true}
          />
        );
      case TemplateGroupId.SAMPLE_ESI:
      case TemplateGroupId.SAMPLE:
        return (
          <SampleDeclarationContainer
            sample={createSampleStub(templateId, questionarySteps, 0, '0')}
            previewMode={true}
          />
        );
      case TemplateGroupId.FEEDBACK:
      case TemplateGroupId.VISIT_REGISTRATION:
      case TemplateGroupId.GENERIC_TEMPLATE:
        return (
          <GenericTemplateContainer
            genericTemplate={createGenericTemplateStub(
              templateId,
              questionarySteps,
              0,
              '0'
            )}
            title="Preview"
            previewMode={true}
          />
        );
      case TemplateGroupId.SHIPMENT:
        return (
          <ShipmentContainer
            shipment={createShipmentStub(
              { id: 1 },
              questionarySteps,
              templateId,
              0,
              0
            )}
            previewMode={true}
          />
        );
      case TemplateGroupId.FAP_REVIEW:
        return (
          <ReviewQuestionary
            review={createFapReviewStub(
              templateId,
              questionarySteps,
              user as unknown as BasicUserDetails
            )}
            previewMode={true}
          />
        );
    }
  };

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
        {loading ? <UOLoader /> : renderPreviewComponent(templateGroupId)}
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
