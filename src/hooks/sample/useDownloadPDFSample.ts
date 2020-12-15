import { useCallback } from 'react';

export function useDownloadPDFSample() {
  const downloadSamplePDF = useCallback((sampleId: number | string) => {
    const element = document.createElement('a');
    element.setAttribute('href', '/download/pdf/sample/' + sampleId);
    element.setAttribute('download', 'download');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }, []);

  return downloadSamplePDF;
}
