import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

import StyledModal from 'components/common/StyledModal';
import { createQuestionTemplateRelationForm } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionTemplateRelation, Template } from 'generated/sdk';
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

export default function QuestionTemplateRelationEditor(props: {
  field: QuestionTemplateRelation | null;
  dispatch: React.Dispatch<Event>;
  closeMe: () => void;
  template: Template;
}) {
  const classes = useStyles();

  if (props.field === null) {
    return null;
  }

  return (
    <StyledModal
      open={props.field != null}
      data-cy="question-relation-dialogue"
    >
      <>
        <IconButton
          data-cy="close-modal-btn"
          className={classes.closeButton}
          onClick={props.closeMe}
        >
          <CloseIcon />
        </IconButton>
        {createQuestionTemplateRelationForm({
          questionRel: props.field,
          onOpenQuestionClicked: (question) => {
            props.dispatch({
              type: EventType.OPEN_QUESTION_EDITOR,
              payload: question,
            });
          },
          onUpdated: (template) => {
            props.dispatch({
              type: EventType.QUESTION_REL_UPDATED,
              payload: template,
            });
          },
          onDeleted: (template) => {
            props.dispatch({
              type: EventType.QUESTION_REL_DELETED,
              payload: template,
            });
          },
          closeMe: props.closeMe,
          template: props.template,
        })}
      </>
    </StyledModal>
  );
}
