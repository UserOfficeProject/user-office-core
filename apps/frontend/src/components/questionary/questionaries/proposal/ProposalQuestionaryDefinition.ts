import ProposalSummary from 'components/proposal/ProposalSummary';
import { DefaultReviewWizardStep } from 'components/questionary/DefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import { Sdk, TemplateGroupId } from 'generated/sdk';
import { ProposalSubmissionState } from 'models/questionary/proposal/ProposalSubmissionState';
import { ItemWithQuestionary } from 'models/questionary/QuestionarySubmissionState';

import { QuestionaryDefinition } from '../../QuestionaryRegistry';
import { ProposalQuestionaryWizardStep } from './ProposalQuestionaryWizardStep';

export const proposalQuestionaryDefinition: QuestionaryDefinition = {
  groupId: TemplateGroupId.PROPOSAL,
  displayElementFactory: new DefaultStepDisplayElementFactory(ProposalSummary),
  wizardStepFactory: new DefaultWizardStepFactory(
    ProposalQuestionaryWizardStep,
    new DefaultReviewWizardStep((state) => {
      const proposalState = state as ProposalSubmissionState;

      return proposalState.proposal.submitted === true;
    })
  ),

  getItemWithQuestionary(
    api: Sdk,
    primaryKey: number
  ): Promise<ItemWithQuestionary | null> {
    return api.getProposal({ primaryKey: primaryKey }).then(({ proposal }) => {
      return proposal;
    });
  },
};
