import { SetStateAction, useEffect, useState } from 'react';

import { ShipmentsFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { ShipmentBasic } from 'models/ShipmentSubmissionState';

export function useShipments(filter?: ShipmentsFilter) {
  const api = useDataApi();
  const [shipmentsFilter, setShipmentsFilter] = useState(filter);
  const [shipments, setShipments] = useState<ShipmentBasic[]>([]);
  const [loadingShipments, setLoadingShipments] = useState(true);

  const setShipmentsWithLoading = (data: SetStateAction<ShipmentBasic[]>) => {
    setLoadingShipments(true);
    setShipments(data);
    setLoadingShipments(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingShipments(true);
    api()
      .getShipments({ filter: shipmentsFilter })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.shipments) {
          setShipments(data.shipments);
        }
        setLoadingShipments(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, shipmentsFilter]);

  return {
    loadingShipments,
    shipments,
    setShipmentsWithLoading,
    setShipmentsFilter,
  };
}
