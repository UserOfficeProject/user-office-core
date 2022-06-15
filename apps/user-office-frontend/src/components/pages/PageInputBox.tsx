// It is important to import the Editor which accepts plugins.
import 'tinymce/tinymce';
import 'tinymce/themes/silver/theme';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/ui/oxide/content.min.css';
import 'tinymce/plugins/link';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/image';
import 'tinymce/plugins/code';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/wordcount';
import 'tinymce/icons/default/icons';

import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Editor } from '@tinymce/tinymce-react';
import React, { useState, useEffect } from 'react';

import { PageName } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles(() => ({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: '25px',
    marginLeft: '10px',
  },
}));

export default function PageInputBox(props: {
  pageName: PageName;
  heading: string;
}) {
  const classes = useStyles();
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
      <div className={classes.buttons}>
        <Button
          className={classes.button}
          onClick={() =>
            api({ toastSuccessMessage: 'Updated Page' }).setPageContent({
              id: props.pageName,
              text: content,
            })
          }
        >
          Update
        </Button>
      </div>
    </>
  );
}
