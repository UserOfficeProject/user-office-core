import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React, { useState, useEffect } from 'react';

import Editor from 'components/common/TinyEditor';
import { PageName } from 'generated/sdk';
import { useGetPageContents } from 'hooks/admin/useGetPageContent';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

export default function PageInputBox(props: {
  pageName: PageName;
  heading: string;
  roleIds: number[];
}) {
  const [loading, pageContent] = useGetPageContents(
    props.pageName,
    props.roleIds
  );
  const [content, setPageContent] = useState('');
  const { api } = useDataApiWithFeedback();

  const doAllPageContentsMatch = () => {
    //if a single value was returned and only one was requested everything matches, otherwise one of the requested pages is empty
    if (!Array.isArray(pageContent)) {
      return props.roleIds.length === 1 ? true : false;
    }

    return (
      //if the number of returned pages is the number of requested ones and all pages match the first one
      pageContent.length === props.roleIds.length &&
      !pageContent.slice(1).filter((pc) => pc !== pageContent[0]).length
    );
  };

  const getPageContent = () => {
    return Array.isArray(pageContent) ? pageContent[0] : pageContent;
  };

  useEffect(() => {
    if (doAllPageContentsMatch()) {
      setPageContent(getPageContent());
    } else {
      setPageContent('');
    }
  }, [pageContent]);

  return (
    <>
      <Typography variant="h6" component="h2" gutterBottom>
        <label htmlFor={props.pageName}>{props.heading}</label>
      </Typography>
      {loading ? null : (
        <Editor
          initialValue={doAllPageContentsMatch() ? getPageContent() : ''}
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
          disabled={!props.roleIds.length}
          sx={{
            marginTop: '25px',
            marginLeft: '10px',
          }}
          onClick={() => {
            api({ toastSuccessMessage: 'Updated Page' }).setPageContent({
              pageId: props.pageName,
              text: content,
              roleIds: props.roleIds,
            });
          }}
        >
          Update
        </Button>
      </Box>
    </>
  );
}
