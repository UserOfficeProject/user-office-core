import { DialogContent } from '@mui/material';
import React from 'react';

import StyledDialog from 'components/common/StyledDialog';
import { createQuestionTemplateRelationForm } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionTemplateRelation, Template } from 'generated/sdk';
import { Event, EventType } from 'models/questionary/QuestionaryEditorModel';

import TemplateEditLabel from './QuestionTemplateLabel';

export default function QuestionTemplateRelationEditor(props: {
  field: QuestionTemplateRelation | null;
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
      data-cy="question-relation-dialogue"
      onClose={props.closeMe}
      fullWidth
      maxWidth="md"
    >
      <DialogContent>
        <TemplateEditLabel pageType={'Template'} />

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
      </DialogContent>
    </StyledDialog>
  );
}
