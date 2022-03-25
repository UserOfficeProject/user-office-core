import VisibilityIcon from '@mui/icons-material/Visibility';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import makeStyles from '@mui/styles/makeStyles';
import React, { useState } from 'react';

import {
  AnswerRenderer,
  QuestionRenderer,
} from 'components/questionary/QuestionaryComponentRegistry';

const useStyles = makeStyles(() => ({
  visibilityIconAligned: {
    marginLeft: '-12px',
  },
}));

export const RichTextInputRendererComponent: React.FC<{
  id: string;
  title: string;
  valueToRender: string;
}> = ({ id, title, valueToRender }) => {
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <span>
      <IconButton
        onClick={handleClickOpen}
        data-cy={`${id}_open`}
        className={classes.visibilityIconAligned}
      >
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
