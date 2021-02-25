import { useEffect, useState } from 'react';

import { ShipmentsFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { ShipmentBasic } from 'models/ShipmentSubmissionState';

export function useShipments(filter?: ShipmentsFilter) {
  const [shipmentsFilter, setShipmentsFilter] = useState(filter);
  const [shipments, setShipments] = useState<ShipmentBasic[]>([]);
  const [loadingShipments, setLoadingShipments] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    setLoadingShipments(true);
    api()
      .getShipments({ filter: shipmentsFilter })
      .then((data) => {
        if (data.shipments) {
          setShipments(data.shipments);
        }
        setLoadingShipments(false);
      });
  }, [api, shipmentsFilter]);

  return {
    loadingShipments,
    shipments,
    setShipments,
    setShipmentsFilter,
  };
}
