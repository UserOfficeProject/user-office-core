/* eslint-disable @typescript-eslint/camelcase */
import { FormLabel, FormHelperText, makeStyles } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import { Editor } from '@tinymce/tinymce-react';
import { getIn } from 'formik';
import React, { useState } from 'react';
import { Editor as TinyMCEEditor } from 'tinymce';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { RichTextInputConfig } from 'generated/sdk';

const useStyles = makeStyles(theme => ({
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
    formikProps: { errors, touched, initialValues },
  } = props;
  const {
    question: { proposalQuestionId, question },
  } = answer;

  const fieldError = getIn(errors, proposalQuestionId);
  const initialValue = getIn(initialValues, proposalQuestionId);
  const [stateValue, setStateValue] = useState(initialValue);
  const isError = getIn(touched, proposalQuestionId) && !!fieldError;
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
        id={proposalQuestionId}
        initialValue={initialValue}
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
          init_instance_callback: editor => {
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
