import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { useExperiment } from 'hooks/experiment/useExperiment';
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
  const { experiment } = useExperiment(experimentPk);
  const { blankShipment, error: blankShipmentError } = useBlankShipment(
    experiment?.experimentPk,
    experiment?.proposalPk
  );

  if (blankShipmentError) {
    return <div>{blankShipmentError}</div>;
  }

  if (!blankShipment || !experiment) {
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
