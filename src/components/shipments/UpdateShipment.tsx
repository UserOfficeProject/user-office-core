import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { useShipment } from 'hooks/shipment/useShipment';
import { ShipmentBasic } from 'models/ShipmentSubmissionState';

import ShipmentContainer from './ShipmentContainer';

interface UpdateShipmentProps {
  shipment: ShipmentBasic;
  close: (shipment: ShipmentBasic | null) => void;
}

function UpdateShipment({ close, shipment: { id } }: UpdateShipmentProps) {
  const { shipment } = useShipment(id);

  if (!shipment) {
    return <UOLoader />;
  }

  return (
    <ShipmentContainer
      shipment={shipment}
      done={(shipment) => close({ ...shipment })}
    />
  );
}

export default UpdateShipment;
