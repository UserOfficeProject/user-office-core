import { html } from '@codemirror/lang-html';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import React, { useContext, useEffect, useRef, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { PDFViewer } from './proposal/PdfTemplateEditorViewer';

const starterLayout = `<style>
  body { font-family: sans-serif; }
  .shipment-codes { display: flex; gap: 1rem; align-items: center; }
</style>
<h1>Shipment label</h1>
<p>Experiment reference: {{shipment.externalRef}}</p>
<div class="shipment-codes">
  {{shipmentBarcode}}
  {{shipmentQrCode}}
</div>
`;

type Props = {
  templateId: number;
  questions: { naturalKey: string; question: string }[];
  onClose: () => void;
};

export default function ShipmentLabelEditor({
  templateId,
  questions,
  onClose,
}: Props) {
  const { token } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const editor = useRef<ReactCodeMirrorRef>(null);
  const [layout, setLayout] = useState(starterLayout);
  const [customLayout, setCustomLayout] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>();

  useEffect(() => {
    let active = true;
    api()
      .getTemplate({ templateId })
      .then(({ template }) => {
        if (!template) {
          throw new Error('Shipment declaration template not found');
        }
        if (active) {
          setLayout(template.shipmentLabelTemplate ?? starterLayout);
          setCustomLayout(template.shipmentLabelTemplate != null);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load the shipment label template.');
        }
      });

    return () => {
      active = false;
    };
  }, [api, templateId]);

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl]
  );

  const insert = (snippet: string) => {
    const view = editor.current?.view;
    if (view) {
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: snippet },
        selection: { anchor: from + snippet.length },
      });
      view.focus();
    }
  };

  const renderPreview = async () => {
    const response = await fetch(`/preview/pdf/shipment-label/${templateId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pdfTemplate: layout }),
    });
    if (
      !response.ok ||
      !response.headers.get('content-type')?.includes('application/pdf')
    ) {
      throw new Error(
        'Could not render the PDF. Check the template syntax and try again.'
      );
    }

    setPreviewUrl(URL.createObjectURL(await response.blob()));
  };

  const update = async (action: 'preview' | 'save' | 'reset') => {
    setBusy(true);
    setError('');
    try {
      if (action !== 'reset') {
        await renderPreview();
      }
      if (action !== 'preview') {
        await api({
          toastSuccessMessage: 'Shipment label updated',
        }).updateTemplate({
          templateId,
          shipmentLabelTemplate: action === 'reset' ? null : layout,
        });
        setCustomLayout(action === 'save');
        if (action === 'reset') {
          setLayout(starterLayout);
          setPreviewUrl(undefined);
        }
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Could not update the shipment label.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open fullWidth maxWidth="lg" onClose={busy ? undefined : onClose}>
      <DialogTitle>Shipment label PDF</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography>
            Edit the HTML and insert answers from this declaration template.
            Missing answers are blank. Saved changes also apply to reprints.
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {ready && (
            <>
              <Stack direction="row" spacing={1}>
                <Button
                  disabled={busy}
                  onClick={() => insert('{{shipmentBarcode}}')}
                >
                  Insert barcode
                </Button>
                <Button
                  disabled={busy}
                  onClick={() => insert('{{shipmentQrCode}}')}
                >
                  Insert QR code
                </Button>
                <TextField
                  select
                  size="small"
                  label="Insert answer"
                  value=""
                  disabled={busy || questions.length === 0}
                  sx={{ minWidth: 200 }}
                  onChange={(event) =>
                    insert(
                      `{{lookup answers ${JSON.stringify(event.target.value)}}}`
                    )
                  }
                >
                  {questions.map(({ naturalKey, question }) => (
                    <MenuItem key={naturalKey} value={naturalKey}>
                      {question}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <CodeMirror
                ref={editor}
                value={layout}
                minHeight="200px"
                maxHeight="45vh"
                extensions={[html()]}
                editable={!busy}
                aria-label="Shipment label HTML"
                onChange={setLayout}
              />
            </>
          )}
          {previewUrl && <PDFViewer fileUrl={previewUrl} />}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Close
        </Button>
        <Button
          onClick={() => update('reset')}
          disabled={busy || !customLayout}
        >
          Restore default
        </Button>
        <Button onClick={() => update('preview')} disabled={busy || !ready}>
          Preview
        </Button>
        <Button
          onClick={() => update('save')}
          disabled={busy || !ready}
          variant="contained"
        >
          Save layout
        </Button>
      </DialogActions>
    </Dialog>
  );
}
