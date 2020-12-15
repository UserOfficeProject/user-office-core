import { useCallback } from 'react';

export function useDownloadXLSXSEP() {
  const downloadSEPXLSX = useCallback((sepId, callId) => {
    const element = document.createElement('a');
    element.setAttribute('href', `/download/xlsx/sep/${sepId}/call/${callId}`);
    element.setAttribute('download', 'download');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }, []);

  return downloadSEPXLSX;
}
