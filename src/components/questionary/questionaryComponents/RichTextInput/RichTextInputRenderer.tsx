import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import React, { useState } from 'react';

import {
  AnswerRenderer,
  QuestionRenderer,
} from 'components/questionary/QuestionaryComponentRegistry';

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
      <IconButton onClick={handleClickOpen} data-cy={`${id}_open`}>
        <VisibilityIcon />
      </IconButton>
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
          <Button onClick={handleClose} color="primary">
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
