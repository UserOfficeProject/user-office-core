import { TemplateGroupId } from 'generated/sdk';

import { QuestionaryDefinition } from '../../QuestionaryRegistry';
import { SampleStepDisplayElementFactory } from './SampleStepDisplayElementFactory';
import { SampleWizardStepFactory } from './SampleWizardStepFactory';

export const sampleQuestionaryDefinition: QuestionaryDefinition = {
  groupId: TemplateGroupId.SAMPLE,
  displayElementFactory: new SampleStepDisplayElementFactory(),
  wizardStepFactory: new SampleWizardStepFactory(),
};
