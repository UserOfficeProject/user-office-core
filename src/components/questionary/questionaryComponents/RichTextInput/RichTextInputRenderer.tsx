import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useState } from 'react';

import {
  AnswerRenderer,
  QuestionRenderer,
} from 'components/questionary/QuestionaryComponentRegistry';
import stripHtml from 'utils/stripHtml';

import { truncateString } from '../../../../utils/truncateString';

export const RichTextInputRendererComponent: React.FC<{
  id: string;
  title: string;
  valueToRender: string;
}> = ({ id, title, valueToRender }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <span>
      <Typography
        variant="body1"
        onClick={handleClickOpen}
        data-cy={`${id}_open`}
        sx={{ cursor: 'pointer', ':hover': { textDecoration: 'underline' } }}
      >
        {`${truncateString(stripHtml(valueToRender), 100)}`}
      </Typography>

      <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          <div
            dangerouslySetInnerHTML={{
              __html: valueToRender,
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} variant="text">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </span>
  );
};

export const RichTextInputAnswerRenderer: AnswerRenderer = (answer) => (
  <RichTextInputRendererComponent
    id={answer.question.id}
    title={answer.question.question}
    valueToRender={answer.value}
  />
);

export const RichTextInputQuestionRenderer: QuestionRenderer = (question) => (
  <span>{question.question}</span>
);
