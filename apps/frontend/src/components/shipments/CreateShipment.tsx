import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { useScheduledEvent } from 'hooks/scheduledEvent/useScheduledEvent';
import { useBlankShipment } from 'hooks/shipment/useBlankShipment';
import { ShipmentCore } from 'models/questionary/shipment/ShipmentCore';

import ShipmentContainer from './ShipmentContainer';

interface CreateShipmentProps {
  experimentPk: number;
  onShipmentSubmitted?: (shipment: ShipmentCore) => void;
  onShipmentCreated?: (shipment: ShipmentCore) => void;
}
function CreateShipment({
  experimentPk,
  onShipmentSubmitted,
  onShipmentCreated,
}: CreateShipmentProps) {
  const { scheduledEvent } = useScheduledEvent(experimentPk);
  const { blankShipment, error: blankShipmentError } = useBlankShipment(
    scheduledEvent?.id,
    scheduledEvent?.proposalPk
  );

  if (blankShipmentError) {
    return <div>{blankShipmentError}</div>;
  }

  if (!blankShipment || !scheduledEvent) {
    return <UOLoader />;
  }

  return (
    <ShipmentContainer
      shipment={blankShipment}
      onShipmentSubmitted={onShipmentSubmitted}
      onShipmentCreated={onShipmentCreated}
    />
  );
}

export default CreateShipment;
