import { useEffect, useState } from 'react';

import { GetShipmentQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useShipment(shipmentId: number) {
  const [shipment, setShipment] = useState<GetShipmentQuery['shipment'] | null>(
    null
  );

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    api()
      .getShipment({ shipmentId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.shipment) {
          setShipment(data.shipment);
        }
      });

    return () => {
      unmounted = true;
    };
  }, [api, shipmentId]);

  return { shipment };
}
