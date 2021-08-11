import ProposalSummary from 'components/proposal/ProposalSummary';
import { DefaultReviewWizardStep } from 'components/questionary/createDefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import { TemplateCategoryId } from 'generated/sdk';
import { ProposalSubmissionState } from 'models/questionary/proposal/ProposalSubmissionState';

import { QuestionaryDefinition } from '../../QuestionaryRegistry';
import { ProposalQuestionaryWizardStep } from './ProposalQuestionaryWizardStep';

export const proposalQuestionaryDefinition: QuestionaryDefinition = {
  categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
  displayElementFactory: new DefaultStepDisplayElementFactory(ProposalSummary),
  wizardStepFactory: new DefaultWizardStepFactory(
    ProposalQuestionaryWizardStep,
    new DefaultReviewWizardStep((state) => {
      const proposalState = state as ProposalSubmissionState;

      return proposalState.proposal.submitted === true;
    })
  ),
};
