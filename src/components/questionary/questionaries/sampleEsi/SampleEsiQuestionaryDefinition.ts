import { DefaultReviewWizardStep } from 'components/questionary/createDefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import SampleEsiReview from 'components/sampleEsi/SampleEsiReview';
import { TemplateGroupId } from 'generated/sdk';

import { QuestionaryDefinition } from '../../QuestionaryRegistry';
import { SampleEsiWizardStep } from './SampleEsiWizardStep';

export const sampleEsiQuestionaryDefinition: QuestionaryDefinition = {
  groupId: TemplateGroupId.SAMPLE_ESI,
  displayElementFactory: new DefaultStepDisplayElementFactory(SampleEsiReview),
  wizardStepFactory: new DefaultWizardStepFactory(
    SampleEsiWizardStep,
    new DefaultReviewWizardStep(() => false)
  ),
};
