import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { useShipment } from 'hooks/shipment/useShipment';
import { ShipmentBasic } from 'models/ShipmentSubmissionState';

import ShipmentContainer from './ShipmentContainer';

interface UpdateShipmentProps {
  shipment: ShipmentBasic;
  onShipmentSubmitted: (shipment: ShipmentBasic) => void;
}

function UpdateShipment({
  shipment: { id },
  onShipmentSubmitted,
}: UpdateShipmentProps) {
  const { shipment } = useShipment(id);

  if (!shipment) {
    return <UOLoader />;
  }

  return (
    <ShipmentContainer
      shipment={shipment}
      onShipmentSubmitted={onShipmentSubmitted}
    />
  );
}

export default UpdateShipment;
