import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import { useTheme } from '@mui/material/styles';
import { getIn } from 'formik';
import React, { useState } from 'react';
import { Editor as TinyMCEEditor } from 'tinymce';

import Editor from 'components/common/TinyEditor';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { RichTextInputConfig } from 'generated/sdk';

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
  const isError = getIn(touched, id) && !!fieldError;
  const config = answer.config as RichTextInputConfig;
  const theme = useTheme();
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
      <FormLabel sx={{ marginBottom: theme.spacing(2) }}>{question}</FormLabel>
      <Editor
        id={id}
        value={value}
        init={{
          skin: false,
          content_css: false,
          /**
           * Note:  if you add new styling options please make sure the HTML sanitizer rules
           *        on the BE is in sync, otherwise the result will be filtered
           */
          plugins: ['preview', 'advlist', 'lists', 'charmap', 'wordcount'],
          toolbar:
            'undo redo | bold italic underline strikethrough superscript subscript | ' +
            'fontsizeselect formatselect forecolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist | outdent indent | charmap removeformat preview',
          branding: false,
          menubar: false,
        }}
        onEditorChange={(content, editor) => {
          handleCharacterCount(editor);
          onComplete(content);
        }}
      />
      {config.max && (
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            color: theme.palette.grey[600],
          }}
          data-cy="rich-text-char-count"
        >
          Characters: {numberOfChars} / {config.max}
        </Box>
      )}
      {isError && <FormHelperText>{fieldError}</FormHelperText>}
    </FormControl>
  );
}
