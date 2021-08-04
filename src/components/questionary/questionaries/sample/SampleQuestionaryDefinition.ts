import { TemplateCategoryId } from 'generated/sdk';

import { QuestionaryDefinition } from '../../QuestionaryRegistry';
import { SampleStepDisplayElementFactory } from './SampleStepDisplayElementFactory';
import { SampleWizardStepFactory } from './SampleWizardStepFactory';

export const sampleQuestionaryDefinition: QuestionaryDefinition = {
  categoryId: TemplateCategoryId.SAMPLE_DECLARATION,
  displayElementFactory: new SampleStepDisplayElementFactory(),
  wizardStepFactory: new SampleWizardStepFactory(),
};
