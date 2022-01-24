import React from 'react';

import { ProposalScheduledEvent } from 'hooks/proposalBooking/useProposalBookingsScheduledEvents';
import { ShipmentCore } from 'models/questionary/shipment/ShipmentCore';

import CreateShipment from './CreateShipment';
import UpdateShipment from './UpdateShipment';

type CreateUpdateShipmentProps = {
  onShipmentSubmitted: (shipment: ShipmentCore) => void;
  event: ProposalScheduledEvent;
};

function CreateUpdateShipment({
  event,
  onShipmentSubmitted,
}: CreateUpdateShipmentProps) {
  if (event.shipments.length > 1) {
    return <span>Multiple shipments per visit is not supported yet</span>;
  }

  const shipment = event.shipments[0]; // currently only supporting 1 shipment per visit

  return shipment ? (
    <UpdateShipment
      shipment={shipment}
      onShipmentSubmitted={onShipmentSubmitted}
    />
  ) : (
    <CreateShipment event={event} onShipmentSubmitted={onShipmentSubmitted} />
  );
}

export default CreateUpdateShipment;
