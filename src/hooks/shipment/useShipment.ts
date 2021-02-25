import { useEffect, useState } from 'react';

import { GetShipmentQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useShipment(shipmentId: number) {
  const [shipment, setShipment] = useState<GetShipmentQuery['shipment'] | null>(
    null
  );

  const api = useDataApi();

  useEffect(() => {
    api()
      .getShipment({ shipmentId })
      .then((data) => {
        if (data.shipment) {
          setShipment(data.shipment);
        }
      });
  }, [api, shipmentId]);

  return { shipment };
}
