import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

type SearchParamTypePrimitive = string | number | boolean | null;

export type SearchParamsType = Record<
  string,
  SearchParamTypePrimitive | Array<SearchParamTypePrimitive>
>;

export function useTypeSafeSearchParams<T extends SearchParamsType>(
  initialParams: T
): [T, (updater: (prev: T) => T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const [typedParams, setTypedParams] = useState<T>(initialParams);

  // Sync from URL to state
  useEffect(() => {
    const newParams = { ...initialParams };
    Object.keys(newParams).forEach((key) => {
      const value = searchParams.get(key);
      if (value !== null) {
        Reflect.set(newParams, key, value);
      }
    });
    setTypedParams(newParams);
  }, [searchParams, initialParams]);

  // Sync from state to URL
  const setTypedSearchParams = useCallback(
    (updater: (prev: T) => T) => {
      setTypedParams((prev) => {
        const newParams = updater(prev);

        setSearchParams((searchParams) => {
          Object.keys(newParams).forEach((key) => {
            const value = Reflect.get(newParams, key);
            if (
              value === null ||
              value === undefined ||
              value === '' ||
              (Array.isArray(value) && value.length === 0)
            ) {
              searchParams.delete(key);
            } else {
              searchParams.set(key, String(value));
            }
          });

          return searchParams;
        });

        return newParams;
      });
    },
    [setSearchParams]
  );

  return [typedParams, setTypedSearchParams];
}
