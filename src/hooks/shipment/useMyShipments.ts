import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

import { GetMyShipmentsQuery } from './../../generated/sdk';

export function useMyShipments() {
  const [myShipments, setMyShipments] = useState<
    Exclude<GetMyShipmentsQuery['myShipments'], null>
  >([]);
  const [loadingMyShipments, setLoadingMyShipments] = useState(false);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;
    setLoadingMyShipments(true);
    api()
      .getMyShipments()
      .then((data) => {
        if (unmounted) {
          return;
        }
        if (data.myShipments) {
          setMyShipments(data.myShipments);
        }
        setLoadingMyShipments(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return {
    myShipments,
    setMyShipments,
    loadingMyShipments,
  };
}
