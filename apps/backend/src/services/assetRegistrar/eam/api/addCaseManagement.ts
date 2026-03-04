import { container } from 'tsyringe';

import { Tokens } from '../../../../config/Tokens';
import { ExperimentDataSource } from '../../../../datasources/ExperimentDataSource';
import { ProposalDataSource } from '../../../../datasources/ProposalDataSource';
import { ShipmentDataSource } from '../../../../datasources/ShipmentDataSource';
import { UserDataSource } from '../../../../datasources/UserDataSource';
import getAddCaseManagementRequestPayload from '../requests/AddCaseManagement';
import { createAndLogError } from '../utils/createAndLogError';
import { performApiRequest } from '../utils/performApiRequest';

export async function createCaseManagement(
  shipmentId: number,
  containerId: string
) {
  const shipmentDataSource = container.resolve<ShipmentDataSource>(
    Tokens.ShipmentDataSource
  );

  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );

  const experimentDataSource = container.resolve<ExperimentDataSource>(
    Tokens.ExperimentDataSource
  );

  const shipment = await shipmentDataSource.getShipment(shipmentId);
  if (!shipment) {
    throw createAndLogError('Shipment for ticket not found', {
      shipmentId,
    });
  }

  const proposal = await proposalDataSource.get(shipment.proposalPk);
  if (!proposal) {
    throw createAndLogError('Proposal for ticket not found', {
      shipment,
    });
  }

  const experiment = await experimentDataSource.getExperiment(
    shipment.experimentPk
  );
  if (!experiment) {
    throw createAndLogError('Experiment for ticket not found', {
      shipment,
    });
  }

  let localContact = null;
  if (experiment.localContactId) {
    localContact = await userDataSource.getUser(experiment.localContactId);
  }
  const requestPayload = getAddCaseManagementRequestPayload(
    proposal.proposalId,
    proposal.title,
    containerId,
    experiment.startsAt,
    localContact?.email ?? 'not set'
  );

  await performApiRequest('/casemanagement', requestPayload);
}
