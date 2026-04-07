import Box from '@mui/material/Box';
import { PDFDocumentProxy } from 'pdfjs-dist';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';

import { UserContext } from 'context/UserContextProvider';
import { ExperimentSafetyPdfTemplate } from 'generated/sdk';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  '/scripts/pdf.worker.min.mjs',
  import.meta.url
).toString();

const PDFViewer = ({ fileUrl }: { fileUrl: string }) => {
  const [numPages, setNumPages] = useState<number>();
  const pdfViewerContainerRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
  }

  return (
    <Box
      style={{
        height: '1000px',
      }}
      ref={pdfViewerContainerRef}
    >
      <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (_el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
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
