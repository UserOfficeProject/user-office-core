import { DefaultReviewWizardStep } from 'components/questionary/DefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import ShipmentReview from 'components/shipments/ShipmentReview';
import { Sdk, ShipmentStatus, TemplateGroupId } from 'generated/sdk';
import { ItemWithQuestionary } from 'models/questionary/QuestionarySubmissionState';
import { ShipmentSubmissionState } from 'models/questionary/shipment/ShipmentSubmissionState';

import { QuestionaryDefinition } from '../../QuestionaryRegistry';
import { ShipmentQuestionaryWizardStep } from './ShipmentQuestionaryWizardStep';

export const shipmentQuestionaryDefinition: QuestionaryDefinition = {
  groupId: TemplateGroupId.SHIPMENT,
  displayElementFactory: new DefaultStepDisplayElementFactory(ShipmentReview),
  wizardStepFactory: new DefaultWizardStepFactory(
    ShipmentQuestionaryWizardStep,
    new DefaultReviewWizardStep((state) => {
      return (
        (state as ShipmentSubmissionState).shipment.status ===
        ShipmentStatus.SUBMITTED
      );
    })
  ),

  getItemWithQuestionary(
    api: Sdk,
    shipmentId: number
  ): Promise<ItemWithQuestionary | null> {
    return api.getShipment({ shipmentId }).then(({ shipment }) => shipment);
  },
};
