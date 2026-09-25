import { Typography, Box } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import React, { useEffect, useState } from 'react';

import { pugLanguage } from 'components/common/codeMirrorPug';
import CopyToClipboard from 'components/common/CopyToClipboard';
import { TemplateVersion } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import EmailTemplatePreview from './EmailTemplatePreview';

type EmailTemplatePreviewProps = {
  emailTemplateId?: number;
  emailTemplateVersionNumber: number;
};

const EmailTemplateVersionViewer = ({
  emailTemplateId,
  emailTemplateVersionNumber,
}: EmailTemplatePreviewProps) => {
  const { api } = useDataApiWithFeedback();
  const [emailTemplatesVersion, setEmailTemplatesVersion] =
    useState<TemplateVersion>();
  useEffect(() => {
    let unmounted = false;
    api()
      .getEmailVersion({
        emailTemplateId: emailTemplateId ?? -1,
        versionNumber: emailTemplateVersionNumber,
      })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.emailVersion) {
          setEmailTemplatesVersion(data.emailVersion);
        }
      });

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, emailTemplateId, emailTemplateVersionNumber]);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '90vh',
        }}
      >
        <Box
          sx={{
            marginTop: '30px',
            border: '1px solid rgba(0, 0, 0, 0.3)',
            overflow: 'auto',
          }}
        >
          <EmailTemplatePreview
            emailTemplateId={emailTemplatesVersion?.templateId}
            subject={emailTemplatesVersion?.subject ?? ''}
            body={emailTemplatesVersion?.body ?? ''}
            useTemplateFile={false}
          />
        </Box>
        <Box
          sx={{
            width: '30px',
            height: '30px',
          }}
        />
        <Box sx={{ borderLeft: '100px', alignSelf: 'flex-end' }}>
          <Typography>
            <CopyToClipboard
              text={emailTemplatesVersion?.body ?? ''}
              successMessage={`Copied to clipboard`}
              position="left"
            >
              {''}
            </CopyToClipboard>
            <br /> <small>Copy body to Clipboard</small>
          </Typography>
        </Box>

        <Box
          sx={{
            border: '1px solid rgba(0, 0, 0, 0.3)',
          }}
        >
          <Typography>
            <small>Subject: {emailTemplatesVersion?.subject ?? ''}</small>
          </Typography>
          <CodeMirror
            value={emailTemplatesVersion?.body ?? ''}
            maxHeight="45vh"
            extensions={[pugLanguage]}
            editable={false}
            readOnly={true}
          />
        </Box>
      </Box>
    </>
  );
};

export default EmailTemplateVersionViewer;
