import ProposalEsiReview from 'components/proposalEsi/ProposalEsiReview';
import { DefaultReviewWizardStep } from 'components/questionary/DefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import { TemplateGroupId } from 'generated/sdk';
import { ProposalEsiSubmissionState } from 'models/questionary/proposalEsi/ProposalEsiSubmissionState';

import { QuestionaryDefinition } from '../../QuestionaryRegistry';
import { EsiWizardStep } from './EsiWizardStep';

export const esiQuestionaryDefinition: QuestionaryDefinition = {
  groupId: TemplateGroupId.PROPOSAL_ESI,

  displayElementFactory: new DefaultStepDisplayElementFactory(
    ProposalEsiReview
  ),

  wizardStepFactory: new DefaultWizardStepFactory(
    EsiWizardStep,
    new DefaultReviewWizardStep(
      (state) => (state as ProposalEsiSubmissionState).esi.isSubmitted
    )
  ),
};
