import { useState, useEffect } from 'react';

export function useExternalApi(url: string) {
  const [content, setContent] = useState<string[]>([]);

  useEffect(() => {
    let unmounted = false;

    fetch(url)
      .then((data) => data.json())
      .then((data) => setContent(data))
      .catch((err) => console.error(err));

    return () => {
      unmounted = true;
    };
  }, [url]);

  return { content, setContent };
}
