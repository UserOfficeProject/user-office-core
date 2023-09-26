import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

import StyledModal from 'components/common/StyledModal';
import { createQuestionForm } from 'components/questionary/QuestionaryComponentRegistry';
import { Question, Template } from 'generated/sdk';
import { Event, EventType } from 'models/questionary/QuestionaryEditorModel';

const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    '& > svg': {
      color: theme.palette.grey[600],
    },
  },
}));

export default function QuestionEditor(props: {
  field: Question | null;
  dispatch: React.Dispatch<Event>;
  closeMe: () => void;
  template: Template;
}) {
  const classes = useStyles();

  if (props.field === null) {
    return null;
  }

  return (
    <StyledModal open={props.field != null}>
      <>
        <IconButton
          data-cy="close-modal-btn"
          className={classes.closeButton}
          onClick={props.closeMe}
        >
          <CloseIcon />
        </IconButton>
        {createQuestionForm({
          question: props.field,
          onUpdated: (question) => {
            props.dispatch({
              type: EventType.QUESTION_UPDATED,
              payload: question,
            });
          },
          onDeleted: (question) => {
            props.dispatch({
              type: EventType.QUESTION_DELETED,
              payload: question,
            });
          },
          closeMe: props.closeMe,
        })}
      </>
    </StyledModal>
  );
}
