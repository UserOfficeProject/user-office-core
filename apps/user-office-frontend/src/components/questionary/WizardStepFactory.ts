import { QuestionaryStep } from 'generated/sdk';
import { WizardStep } from 'models/questionary/QuestionarySubmissionState';

export interface WizardStepFactory {
  getWizardSteps(questionarySteps: QuestionaryStep[]): WizardStep[];
}
