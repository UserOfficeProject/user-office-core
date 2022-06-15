import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import makeStyles from '@mui/styles/makeStyles';
import { Editor } from '@tinymce/tinymce-react';
import { getIn } from 'formik';
import React, { useState } from 'react';
import { Editor as TinyMCEEditor } from 'tinymce';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { RichTextInputConfig } from 'generated/sdk';

const useStyles = makeStyles((theme) => ({
  label: {
    marginBottom: theme.spacing(2),
  },
  charactersInfo: {
    position: 'absolute',
    right: 0,
    color: theme.palette.grey[600],
  },
}));

export function QuestionaryComponentRichTextInput(props: BasicComponentProps) {
  const {
    answer,
    onComplete,
    formikProps: { errors, touched },
  } = props;
  const {
    value,
    question: { id, question },
  } = answer;

  const fieldError = getIn(errors, id);
  const [stateValue, setStateValue] = useState(value);
  const isError = getIn(touched, id) && !!fieldError;
  const config = answer.config as RichTextInputConfig;
  const classes = useStyles();
  const [numberOfChars, setNumberOfChars] = useState(0);

  const handleCharacterCount = (editor: TinyMCEEditor) => {
    const wordCount = editor.plugins.wordcount;
    setNumberOfChars(wordCount.body.getCharacterCount());
  };

  return (
    <FormControl
      required={config.required}
      error={isError}
      margin="dense"
      fullWidth
    >
      <FormLabel className={classes.label}>{question}</FormLabel>
      <Editor
        id={id}
        initialValue={value}
        init={{
          skin: false,
          content_css: false,
          /**
           * Note:  if you add new styling options please make sure the HTML sanitizer rules
           *        on the BE is in sync, otherwise the result will be filtered
           */
          plugins: ['preview advlist lists charmap wordcount'],
          toolbar:
            'undo redo | bold italic underline strikethrough superscript subscript | ' +
            'fontsizeselect formatselect forecolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist | outdent indent | charmap removeformat preview',
          branding: false,
          menubar: false,
          init_instance_callback: (editor) => {
            handleCharacterCount(editor);
          },
        }}
        onEditorChange={(content, editor) => {
          handleCharacterCount(editor);
          setStateValue(content);
        }}
        onBlur={() => {
          onComplete(stateValue);
        }}
      />
      {config.max && (
        <div className={classes.charactersInfo} data-cy="rich-text-char-count">
          Characters: {numberOfChars} / {config.max}
        </div>
      )}
      {isError && <FormHelperText>{fieldError}</FormHelperText>}
    </FormControl>
  );
}
