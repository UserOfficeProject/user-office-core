import jp from 'jsonpath';
import { useState, useEffect } from 'react';

export function useExternalApi(url: string, path = '') {
  const [content, setContent] = useState<string[]>([]);

  useEffect(() => {
    let unmounted = false;
    if (unmounted) {
      return;
    }
    fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        const isArrayOfStrings =
          Array.isArray(data) && data.every((el) => typeof el === 'string');
        if (isArrayOfStrings) {
          setContent(data);
        } else {
          try {
            const jsonPathFilteredData = jp.query(data, path);
            setContent(jsonPathFilteredData);
          } catch (err) {
            setContent([]);
            throw err;
          }
        }
      })
      .catch((error) => {
        console.error(error);
        setContent([]);
      });

    return () => {
      unmounted = true;
    };
  }, [url, path]);

  return { content, setContent };
}
