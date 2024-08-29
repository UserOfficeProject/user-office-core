import { DialogContent } from '@mui/material';
import React from 'react';

import StyledDialog from 'components/common/StyledDialog';
import { createQuestionForm } from 'components/questionary/QuestionaryComponentRegistry';
import { Question, Template } from 'generated/sdk';
import { Event, EventType } from 'models/questionary/QuestionaryEditorModel';

import TemplateEditLabel from './QuestionTemplateLabel';

export default function QuestionEditor(props: {
  field: Question | null;
  dispatch: React.Dispatch<Event>;
  closeMe: () => void;
  template: Template;
}) {
  if (props.field === null) {
    return null;
  }

  return (
    <StyledDialog
      open={props.field != null}
      fullWidth
      maxWidth="md"
      onClose={props.closeMe}
      title="Edit question"
    >
      <DialogContent dividers>
        <TemplateEditLabel pageType={'Question'} />
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
      </DialogContent>
    </StyledDialog>
  );
}
