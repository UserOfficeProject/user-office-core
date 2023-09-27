import { container } from 'tsyringe';

import { Tokens } from '../../../../config/Tokens';
import { ProposalDataSource } from '../../../../datasources/ProposalDataSource';
import { ScheduledEventDataSource } from '../../../../datasources/ScheduledEventDataSource';
import { ShipmentDataSource } from '../../../../datasources/ShipmentDataSource';
import { UserDataSource } from '../../../../datasources/UserDataSource';
import getRequest from '../requests/AddCaseManagement';
import { createAndLogError } from '../utils/createAndLogError';
import { performApiRequest } from '../utils/performApiRequest';

export async function createTicket(shipmentId: number, containerId: string) {
  const shipmentDataSource = container.resolve<ShipmentDataSource>(
    Tokens.ShipmentDataSource
  );

  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  const scheduledEventDataSource = container.resolve<ScheduledEventDataSource>(
    Tokens.ScheduledEventDataSource
  );

  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
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

  const scheduledEvent = await scheduledEventDataSource.getScheduledEventCore(
    shipment.scheduledEventId
  );
  if (!scheduledEvent) {
    throw createAndLogError('Scheduled event for ticket not found', {
      shipment,
    });
  }

  let localContact = null;
  if (scheduledEvent.localContactId) {
    localContact = await userDataSource.getUser(scheduledEvent.localContactId);
  }
  const request = getRequest(
    proposal.proposalId,
    proposal.title,
    containerId,
    scheduledEvent.startsAt,
    scheduledEvent.endsAt,
    scheduledEvent.startsAt, // This is not correct, but we need a design decision to fix this
    localContact?.email ?? 'not set',
    'DEMAX'
  );

  await performApiRequest(request);
}
