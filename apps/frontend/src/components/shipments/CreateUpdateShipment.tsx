import React from 'react';

import { ShipmentFragment } from 'generated/sdk';
import { ShipmentCore } from 'models/questionary/shipment/ShipmentCore';

import CreateShipment from './CreateShipment';
import UpdateShipment from './UpdateShipment';

type CreateUpdateShipmentProps = {
  onShipmentSubmitted?: (shipment: ShipmentCore) => void;
  onShipmentCreated?: (shipment: ShipmentCore) => void;
  experimentPk: number;
  shipment: ShipmentFragment | null;
};

function CreateUpdateShipment({
  onShipmentSubmitted,
  onShipmentCreated,
  experimentPk,
  shipment,
}: CreateUpdateShipmentProps) {
  return shipment ? (
    <UpdateShipment
      shipment={shipment}
      onShipmentSubmitted={onShipmentSubmitted}
    />
  ) : (
    <CreateShipment
      experimentPk={experimentPk}
      onShipmentSubmitted={onShipmentSubmitted}
      onShipmentCreated={onShipmentCreated}
    />
  );
}

export default CreateUpdateShipment;
