import React from 'react';

import { ShipmentBasic } from 'models/ShipmentSubmissionState';

import CreateShipment from './CreateShipment';
import UpdateShipment from './UpdateShipment';

type CreateUpdateShipmentProps = {
  close: (shipment: ShipmentBasic | null) => void;
  shipment: ShipmentBasic | null;
};

function CreateUpdateShipment({ shipment, close }: CreateUpdateShipmentProps) {
  return shipment ? (
    <UpdateShipment shipment={shipment} close={close} />
  ) : (
    <CreateShipment close={close} />
  );
}

export default CreateUpdateShipment;
