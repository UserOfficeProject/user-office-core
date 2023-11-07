import { Viewer } from '@react-pdf-viewer/core';
import { Worker } from '@react-pdf-viewer/core';
import React, { useCallback, useContext } from 'react';

import '@react-pdf-viewer/core/lib/styles/index.css';

import { UserContext } from 'context/UserContextProvider';
import { PdfTemplate } from 'generated/sdk';

function PdfTemplateEditorViewer({
  pdfTemplate,
}: {
  pdfTemplate: PdfTemplate;
}) {
  const { token } = useContext(UserContext);
  const [generatedPdfPreviewBlob, setGeneratedPdfPreviewBlob] =
    React.useState<Blob>();
  const fetchGeneratedPdfPreviewData = useCallback(async () => {
    const pdf = await fetch(
      `/preview/pdf/proposal?pdfTemplateId=${pdfTemplate.pdfTemplateId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const pdfBlob = await pdf.blob();

    return pdfBlob;
  }, [pdfTemplate, token]);

  React.useEffect(() => {
    fetchGeneratedPdfPreviewData().then((pdfBlob) => {
      setGeneratedPdfPreviewBlob(pdfBlob);
    });
  }, [fetchGeneratedPdfPreviewData]);

  return (
    <Worker workerUrl={'/scripts/pdf.worker.min.js'}>
      <div
        style={{
          border: '1px solid rgba(0, 0, 0, 0.3)',
          height: '1000px',
        }}
      >
        {generatedPdfPreviewBlob && (
          <Viewer fileUrl={URL.createObjectURL(generatedPdfPreviewBlob)} />
        )}
      </div>
    </Worker>
  );
}

export default React.memo(
  PdfTemplateEditorViewer,
  (prevProps, nextProps) =>
    JSON.stringify(prevProps.pdfTemplate) ===
    JSON.stringify(nextProps.pdfTemplate)
);
