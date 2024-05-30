import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import React, { useState, useEffect } from 'react';

import Editor from 'components/common/TinyEditor';
import { PageName } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

export default function PageInputBox(props: {
  pageName: PageName;
  heading: string;
}) {
  const [loading, pageContent] = useGetPageContent(props.pageName);
  const [content, setPageContent] = useState('');
  const { api } = useDataApiWithFeedback();

  useEffect(() => {
    setPageContent(pageContent);
  }, [pageContent]);

  return (
    <>
      <Typography variant="h6" component="h2" gutterBottom>
        <label htmlFor={props.pageName}>{props.heading}</label>
      </Typography>
      <Divider />
      {loading ? null : (
        <Editor
          initialValue={pageContent}
          init={{
            skin: false,
            content_css: false,
            plugins: ['link', 'preview', 'image', 'code'],
            toolbar: 'bold italic',
            branding: false,
          }}
          id={props.pageName}
          onEditorChange={(content) => setPageContent(content)}
        />
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          sx={{
            marginTop: '25px',
            marginLeft: '10px',
          }}
          onClick={() =>
            api({ toastSuccessMessage: 'Updated Page' }).setPageContent({
              id: props.pageName,
              text: content,
            })
          }
        >
          Update
        </Button>
      </Box>
    </>
  );
}
