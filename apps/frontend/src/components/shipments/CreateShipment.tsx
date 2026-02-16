import Alert from '@mui/material/Alert';
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
  onDirtyStateChange?: (isDirty: boolean) => void;
}
function CreateShipment({
  experimentPk,
  onShipmentSubmitted,
  onShipmentCreated,
  onDirtyStateChange,
}: CreateShipmentProps) {
  const { experiment } = useExperiment(experimentPk);
  const { blankShipment, error: blankShipmentError } = useBlankShipment(
    experiment?.experimentPk,
    experiment?.proposalPk
  );

  if (blankShipmentError) {
    return (
      <Alert severity="error">
        <strong>Error:</strong>
        {blankShipmentError}
      </Alert>
    );
  }

  if (!blankShipment || !experiment) {
    return <UOLoader />;
  }

  return (
    <ShipmentContainer
      shipment={blankShipment}
      onShipmentSubmitted={onShipmentSubmitted}
      onShipmentCreated={onShipmentCreated}
      onDirtyStateChange={onDirtyStateChange}
    />
  );
}

export default CreateShipment;
