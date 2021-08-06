import { QuestionaryWizardStep } from 'components/questionary/DefaultWizardStepFactory';
import { ShipmentStatus } from 'generated/sdk';
import { QuestionarySubmissionState } from 'models/QuestionarySubmissionState';

import { ShipmentSubmissionState } from './../../../../models/ShipmentSubmissionState';

export class ShipmentQuestionaryWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState): boolean {
    const shipmentState = state as ShipmentSubmissionState;

    return shipmentState.shipment.status !== ShipmentStatus.SUBMITTED;
  }
}
