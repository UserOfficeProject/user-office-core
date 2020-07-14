// It is important to import the Editor which accepts plugins.
import 'tinymce/tinymce';
import 'tinymce/themes/silver/theme';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/ui/oxide/content.min.css';
import 'tinymce/plugins/link';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/image';
import 'tinymce/plugins/code';
import 'tinymce/icons/default/icons';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Editor } from '@tinymce/tinymce-react';
import { useSnackbar } from 'notistack';
import React, { useState, useEffect } from 'react';

import { PageName } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { useDataApi } from 'hooks/common/useDataApi';

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
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setPageContent(pageContent);
  }, [pageContent]);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {props.heading}
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
          onEditorChange={content => setPageContent(content)}
        />
      )}
      <div className={classes.buttons}>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={() =>
            api()
              .setPageContent({ id: props.pageName, text: content })
              .then(() =>
                enqueueSnackbar('Updated Page', { variant: 'success' })
              )
          }
        >
          Update
        </Button>
      </div>
    </>
  );
}
