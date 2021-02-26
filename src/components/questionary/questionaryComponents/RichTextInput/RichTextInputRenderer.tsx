import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import React, { useState } from 'react';

import { Renderers } from 'components/questionary/QuestionaryComponentRegistry';
import { Answer } from 'generated/sdk';

const RichTextInputAnswerRenderer = ({ answer }: { answer: Answer }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <span>
      <IconButton
        onClick={handleClickOpen}
        data-cy={`${answer.question.proposalQuestionId}_open`}
      >
        <VisibilityIcon />
      </IconButton>
      <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose}>
        <DialogTitle>{answer.question.question}</DialogTitle>

        <DialogContent>
          <div
            dangerouslySetInnerHTML={{
              __html: answer.value,
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

const richTextInputRenderer: Renderers = {
  answerRenderer: (props) => <RichTextInputAnswerRenderer {...props} />,
  questionRenderer: ({ question }) => <span>{question.question}</span>,
};

export default richTextInputRenderer;
