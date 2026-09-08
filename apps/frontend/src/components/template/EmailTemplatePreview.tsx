import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { EmailTemplatePreviewQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { useDebouncedValue } from 'hooks/common/useDebouncedValue';
import { detectPugVariables } from 'utils/pugTemplateVariables';

type PreviewResult = NonNullable<
  EmailTemplatePreviewQuery['emailTemplatePreview']
>;

type EmailTemplatePreviewProps = {
  emailTemplateId?: number;
  subject: string;
  body: string;
  useTemplateFile: boolean;
};

const PREVIEW_CSP =
  `<meta http-equiv="Content-Security-Policy" ` +
  `content="default-src 'none'; style-src 'unsafe-inline'; img-src data:;">`;

const EmailTemplatePreview = ({
  emailTemplateId,
  subject,
  body,
  useTemplateFile,
}: EmailTemplatePreviewProps) => {
  const api = useDataApi();

  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileSource, setFileSource] = useState<{
    subject: string;
    body: string;
  } | null>(null);
  const requestId = useRef(0);

  const inputKey = useMemo(
    () => JSON.stringify({ emailTemplateId, subject, body, useTemplateFile }),
    [emailTemplateId, subject, body, useTemplateFile]
  );
  const debouncedInputKey = useDebouncedValue(inputKey, 500);

  const isUnsavedTemplateFile = useTemplateFile && !emailTemplateId;

  useEffect(() => {
    const input = JSON.parse(debouncedInputKey) as {
      emailTemplateId?: number;
      subject: string;
      body: string;
      useTemplateFile: boolean;
    };

    if (isUnsavedTemplateFile) {
      setPreview(null);

      return;
    }

    if (!input.useTemplateFile && !input.body.trim() && !input.subject.trim()) {
      setPreview(null);

      return;
    }

    const detectionSource = input.useTemplateFile
      ? fileSource ?? { subject: '', body: '' }
      : { subject: input.subject, body: input.body };
    const variables = detectPugVariables(
      detectionSource.subject,
      detectionSource.body
    ).map((key) => ({ key, value: key }));

    const id = ++requestId.current;
    setLoading(true);

    api()
      .emailTemplatePreview({
        emailTemplatePreviewInput: {
          emailTemplateId: input.emailTemplateId,
          useTemplateFile: input.useTemplateFile,
          subject: input.useTemplateFile ? null : input.subject,
          body: input.useTemplateFile ? null : input.body,
          variables,
        },
      })
      .then((data) => {
        if (id !== requestId.current) {
          return;
        }

        const result = data.emailTemplatePreview ?? null;
        setPreview(result);

        if (result?.sourceBody != null || result?.sourceSubject != null) {
          const source = {
            subject: result.sourceSubject ?? '',
            body: result.sourceBody ?? '',
          };

          setFileSource((previous) =>
            previous?.subject === source.subject &&
            previous?.body === source.body
              ? previous
              : source
          );
        }
      })
      .finally(() => {
        if (id === requestId.current) {
          setLoading(false);
        }
      });
  }, [debouncedInputKey, fileSource, isUnsavedTemplateFile, api]);

  if (isUnsavedTemplateFile) {
    return (
      <Alert severity="info" data-cy="email-template-preview-unsaved">
        Save the template first to preview a file-based template.
      </Alert>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {preview?.error && (
        <Alert
          severity="error"
          sx={{ mb: 1 }}
          data-cy="email-template-preview-error"
        >
          {preview.error.message}
          {preview.error.line != null && ` (line ${preview.error.line})`}
        </Alert>
      )}

      {preview?.subject != null && (
        <Typography
          variant="subtitle2"
          sx={{ mb: 1 }}
          data-cy="email-template-preview-subject"
        >
          Subject: {preview.subject}
        </Typography>
      )}

      <Box
        component="iframe"
        title="Email template preview"
        data-cy="email-template-preview-frame"
        srcDoc={PREVIEW_CSP + (preview?.body ?? '')}
        sandbox=""
        referrerPolicy="no-referrer"
        sx={{
          width: '100%',
          height: '45vh',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          backgroundColor: '#fff',
        }}
      />

      <Typography variant="caption" color="textSecondary">
        Variables such as {'#{proposalTitle}'} are shown as their name. The
        preview renders before CSS inlining and without the footer logo, so the
        delivered email may differ slightly.
      </Typography>

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <UOLoader />
        </Box>
      )}
    </Box>
  );
};

export default EmailTemplatePreview;
