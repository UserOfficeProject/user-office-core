/* eslint-disable @typescript-eslint/camelcase */
import { FormLabel, FormHelperText, makeStyles } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import { Editor } from '@tinymce/tinymce-react';
import { getIn } from 'formik';
import React, { useState } from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { RichTextInputConfig } from 'generated/sdk';

const useStyles = makeStyles(theme => ({
  label: {
    marginBottom: theme.spacing(2),
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
          plugins: ['preview advlist lists charmap'],
          toolbar:
            'undo redo | bold italic underline strikethrough superscript subscript | ' +
            'fontsizeselect formatselect forecolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist | outdent indent | charmap removeformat preview',
          branding: false,
          menubar: false,
        }}
        onEditorChange={content => {
          setStateValue(content);
        }}
        onBlur={() => {
          onComplete(stateValue);
        }}
      />
      {isError && <FormHelperText>{fieldError}</FormHelperText>}
    </FormControl>
  );
}
