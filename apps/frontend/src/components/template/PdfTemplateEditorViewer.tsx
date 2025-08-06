import Box from '@mui/material/Box';
import {
  Viewer,
  Worker,
  Plugin,
  SpecialZoomLevel,
  createStore,
  PluginFunctions,
} from '@react-pdf-viewer/core';
import React, { useCallback, useContext, useEffect, useRef } from 'react';

import '@react-pdf-viewer/core/lib/styles/index.css';

import { UserContext } from 'context/UserContextProvider';
import { PdfTemplate } from 'generated/sdk';

interface CustomZoomPlugin extends Plugin {
  zoomTo(scale: number | SpecialZoomLevel): void;
}

interface StoreProps {
  zoom?(scale: number | SpecialZoomLevel): void;
}

const CustomZoomPlugin = (): CustomZoomPlugin => {
  const store = React.useMemo(() => createStore<StoreProps>({}), []);

  return {
    install: (pluginFunctions: PluginFunctions) => {
      store.update('zoom', pluginFunctions.zoom);
    },
    zoomTo: (scale: number | SpecialZoomLevel) => {
      const zoom = store.get('zoom');
      if (zoom) {
        zoom(scale);
      }
    },
  };
};

const PDFViewer = ({ fileUrl }: { fileUrl: string }) => {
  const customZoomPluginInstance = CustomZoomPlugin();
  const { zoomTo } = customZoomPluginInstance;
  const pdfViewerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        zoomTo(SpecialZoomLevel.PageWidth);
      }
    });

    const pdfViewerContainerRefCurrent = pdfViewerContainerRef.current;
    if (pdfViewerContainerRefCurrent) {
      resizeObserver.observe(pdfViewerContainerRefCurrent);
    }

    return () => {
      if (pdfViewerContainerRefCurrent) {
        resizeObserver.unobserve(pdfViewerContainerRefCurrent);
      }
    };
  }, [zoomTo]);

  return (
    <Box
      style={{
        height: '1000px',
      }}
      ref={pdfViewerContainerRef}
    >
      <Viewer fileUrl={fileUrl} plugins={[customZoomPluginInstance]} />
    </Box>
  );
};

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
      {generatedPdfPreviewBlob && (
        <PDFViewer fileUrl={URL.createObjectURL(generatedPdfPreviewBlob)} />
      )}
    </Worker>
  );
}

export default React.memo(
  PdfTemplateEditorViewer,
  (prevProps, nextProps) =>
    JSON.stringify(prevProps.pdfTemplate) ===
    JSON.stringify(nextProps.pdfTemplate)
);
