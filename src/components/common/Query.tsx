import React, { useEffect, useState } from 'react';

export const Query = <T extends unknown>(props: {
  children: MyQueryChildrenType<T>;
  serviceCall: () => Promise<T>;
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    async function loadData() {
      props
        .serviceCall()
        .then((serviceData) => {
          setData(serviceData);
        })
        .catch((err) => {
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
    loadData();
  }, [props, props.serviceCall]);

  return <div>{props.children({ loading, error, data })}</div>;
};

type MyQueryChildrenType<T> = ({
  loading,
  error,
  data,
}: {
  loading: boolean;
  error: boolean;
  data: T | null;
}) => JSX.Element;
