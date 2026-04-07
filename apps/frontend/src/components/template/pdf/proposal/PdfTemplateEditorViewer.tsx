import Box from '@mui/material/Box';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { PDFDocumentProxy } from 'pdfjs-dist';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import React, { useCallback, useContext, useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';

import { UserContext } from 'context/UserContextProvider';
import { ProposalPdfTemplate } from 'generated/sdk';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  '/scripts/pdf.worker.min.mjs',
  import.meta.url
).toString();

const PDFViewer = ({ fileUrl }: { fileUrl: string }) => {
  const [numPages, setNumPages] = useState<number>(); // try not using state
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const resizeObserverOptions = {};
  const maxWidth = 8000;

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

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
      ref={setContainerRef}
    >
      <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (_el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={
              containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
            }
          />
        ))}
      </Document>
    </Box>
  );
};

function PdfTemplateEditorViewer({
  pdfTemplate,
}: {
  pdfTemplate: ProposalPdfTemplate;
}) {
  const { token } = useContext(UserContext);
  const [generatedPdfPreviewBlob, setGeneratedPdfPreviewBlob] =
    React.useState<Blob>();

  const fetchGeneratedPdfPreviewData = useCallback(async () => {
    const pdf = await fetch(
      `/preview/pdf/proposal?pdfTemplateId=${pdfTemplate.proposalPdfTemplateId}`,
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
