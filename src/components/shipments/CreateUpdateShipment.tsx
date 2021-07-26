import React from 'react';

import { VisitFragment } from 'generated/sdk';
import { ShipmentBasic } from 'models/ShipmentSubmissionState';

import CreateShipment from './CreateShipment';
import UpdateShipment from './UpdateShipment';

type CreateUpdateShipmentProps = {
  onShipmentSubmitted: (shipment: ShipmentBasic) => void;
  visit: VisitFragment & {
    shipments: ShipmentBasic[];
  };
};

function CreateUpdateShipment({
  visit,
  onShipmentSubmitted,
}: CreateUpdateShipmentProps) {
  if (visit.shipments.length > 1) {
    return <span>Multiple shipments per visit is not supported yet</span>;
  }

  const shipment = visit.shipments[0]; // currently only supporting 1 shipment per visit

  return shipment ? (
    <UpdateShipment
      shipment={shipment}
      onShipmentSubmitted={onShipmentSubmitted}
    />
  ) : (
    <CreateShipment visit={visit} onShipmentSubmitted={onShipmentSubmitted} />
  );
}

export default CreateUpdateShipment;
