import jp from 'jsonpath';
import { useState, useEffect } from 'react';

export function useExternalApi(url: string, path = '') {
  const [content, setContent] = useState<string[]>([]);

  useEffect(() => {
    let unmounted = false;
    if (unmounted) {
      return;
    }

    const fetchData = async (url: string) => {
      try {
        const response = await fetch(url);
        const data = await response.json();

        const isArrayOfStrings =
          Array.isArray(data) && data.every((el) => typeof el === 'string');
        if (isArrayOfStrings) {
          setContent(data);
        } else {
          try {
            const jsonPathFilteredData = jp.query(data, path);
            setContent(jsonPathFilteredData);
          } catch (jsonPathError) {
            setContent([]);
            throw jsonPathError;
          }
        }
      } catch (error) {
        console.error(error);
        setContent([]);
      }
    };

    fetchData(url);

    return () => {
      unmounted = true;
    };
  }, [url, path]);

  return { content, setContent };
}
