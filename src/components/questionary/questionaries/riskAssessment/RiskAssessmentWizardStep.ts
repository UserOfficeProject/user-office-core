import { QuestionaryWizardStep } from 'components/questionary/DefaultWizardStepFactory';
import { RiskAssessmentStatus } from 'generated/sdk';
import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';
import { RiskAssessmentSubmissionState } from 'models/questionary/riskAssessment/RiskAssessmentSubmissionState';

export class RiskAssessmentWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState): boolean {
    const registrationState = state as RiskAssessmentSubmissionState;

    return (
      registrationState.riskAssessment.status !== RiskAssessmentStatus.SUBMITTED
    );
  }
}
