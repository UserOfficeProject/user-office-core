import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { useShipment } from 'hooks/shipment/useShipment';
import { ShipmentCore } from 'models/questionary/shipment/ShipmentCore';

import ShipmentContainer from './ShipmentContainer';

interface UpdateShipmentProps {
  shipment: ShipmentCore;
  onShipmentSubmitted?: (shipment: ShipmentCore) => void;
  onDirtyStateChange?: (isDirty: boolean) => void;
}

function UpdateShipment({
  shipment: { id },
  onShipmentSubmitted,
  onDirtyStateChange,
}: UpdateShipmentProps) {
  const { shipment } = useShipment(id);

  if (!shipment) {
    return <UOLoader />;
  }

  return (
    <ShipmentContainer
      shipment={shipment}
      onShipmentSubmitted={onShipmentSubmitted}
      onDirtyStateChange={onDirtyStateChange}
    />
  );
}

export default UpdateShipment;
