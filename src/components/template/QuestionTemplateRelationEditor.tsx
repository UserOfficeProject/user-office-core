import React from 'react';

import StyledModal from 'components/common/StyledModal';
import { createQuestionTemplateRelationForm } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionTemplateRelation, Template } from 'generated/sdk';
import { Event } from 'models/QuestionaryEditorModel';

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
    <StyledModal
      onClose={props.closeMe}
      open={props.field != null}
      data-cy="question-relation-dialogue"
    >
      {createQuestionTemplateRelationForm({
        field: props.field,
        dispatch: props.dispatch,
        closeMe: props.closeMe,
        template: props.template,
      })}
    </StyledModal>
  );
}
