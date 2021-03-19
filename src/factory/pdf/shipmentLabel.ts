import baseContext from '../../buildContext';
import { Shipment } from '../../models/Shipment';
import { UserWithRole } from '../../models/User';

export type ShipmentPDFData = {
  shipment: Shipment;
};

export async function collectShipmentPDFData(
  shipmentId: number,
  user: UserWithRole,
  notify?: CallableFunction
): Promise<ShipmentPDFData> {
  const shipment = await baseContext.queries.shipment.getShipment(
    user,
    shipmentId
  );
  if (!shipment) {
    throw new Error(
      `shipment with ID '${shipmentId}' not found, or the user has insufficient rights`
    );
  }

  notify?.(`shipment_${shipment.id}.pdf`);

  const questionary = await baseContext.queries.questionary.getQuestionary(
    user,
    shipment.questionaryId
  );

  if (!questionary) {
    throw new Error(
      `Questionary with ID '${shipment.questionaryId}' not found, or the user has insufficient rights`
    );
  }

  const questionarySteps = await baseContext.queries.questionary.getQuestionarySteps(
    user,
    shipment.questionaryId
  );

  if (!questionarySteps) {
    throw new Error(
      `Questionary steps for Questionary ID '${shipment.questionaryId}' not found, or the user has insufficient rights`
    );
  }

  const out = {
    shipment: {
      ...shipment,
    },
  };

  return out;
}
