import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import React, { useState } from 'react';

import StyledDialog from 'components/common/StyledDialog';
import {
  AnswerRenderer,
  QuestionRenderer,
} from 'components/questionary/QuestionaryComponentRegistry';
import stripHtml from 'utils/stripHtml';

import { truncateString } from '../../../../utils/truncateString';

export const RichTextInputRendererComponent = ({
  id,
  title,
  valueToRender,
}: {
  id: string;
  title: string;
  valueToRender: string;
}) => {
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

      <StyledDialog
        fullWidth
        maxWidth="lg"
        open={open}
        onClose={handleClose}
        title={title}
      >
        <DialogContent dividers>
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
      </StyledDialog>
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
