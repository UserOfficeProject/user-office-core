import { QuestionaryStep } from 'generated/sdk';
import { WizardStep } from 'models/QuestionarySubmissionState';

export interface WizardStepFactory {
  getWizardSteps(questionarySteps: QuestionaryStep[]): WizardStep[];
}
