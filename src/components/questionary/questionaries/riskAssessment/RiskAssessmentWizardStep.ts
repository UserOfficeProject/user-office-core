import { QuestionaryWizardStep } from 'components/questionary/DefaultWizardStepFactory';
import { RiskAssessmentStatus } from 'generated/sdk';
import { QuestionarySubmissionState } from 'models/QuestionarySubmissionState';
import { RiskAssessmentSubmissionState } from 'models/RiskAssessmentSubmissionState';

export class RiskAssessmentWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState): boolean {
    const registrationState = state as RiskAssessmentSubmissionState;

    return (
      registrationState.riskAssessment.status !== RiskAssessmentStatus.SUBMITTED
    );
  }
}
