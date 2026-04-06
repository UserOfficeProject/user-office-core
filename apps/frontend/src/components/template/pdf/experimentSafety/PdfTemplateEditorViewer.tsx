import Box from '@mui/material/Box';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';

import { UserContext } from 'context/UserContextProvider';
import { ExperimentSafetyPdfTemplate } from 'generated/sdk';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  '/scripts/pdf.worker.min.mjs',
  import.meta.url
).toString();

const PDFViewer = ({ fileUrl }: { fileUrl: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageNumber, setPageNumber] = useState<number>(1);
  const pdfViewerContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      style={{
        height: '1000px',
      }}
      ref={pdfViewerContainerRef}
    >
      <Document file={fileUrl}>
        <Page pageNumber={pageNumber} />
      </Document>
    </Box>
  );
};

function PdfTemplateEditorViewer({
  pdfTemplate,
}: {
  pdfTemplate: ExperimentSafetyPdfTemplate;
}) {
  const { token } = useContext(UserContext);
  const [generatedPdfPreviewBlob, setGeneratedPdfPreviewBlob] =
    React.useState<Blob>();

  const fetchGeneratedPdfPreviewData = useCallback(async () => {
    const pdf = await fetch(
      `/preview/pdf/experiment-safety?pdfTemplateId=${pdfTemplate.experimentSafetyPdfTemplateId}`,
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

  if (generatedPdfPreviewBlob) {
    return <PDFViewer fileUrl={URL.createObjectURL(generatedPdfPreviewBlob)} />;
  } else {
    return <div></div>;
  }
}

export default React.memo(
  PdfTemplateEditorViewer,
  (prevProps, nextProps) =>
    JSON.stringify(prevProps.pdfTemplate) ===
    JSON.stringify(nextProps.pdfTemplate)
);
