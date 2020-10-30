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
  // const map = new Map<DataType, TFormSignature<QuestionTemplateRelation>>();
  // map.set(DataType.BOOLEAN, QuestionTemplateRelationBooleanForm);
  // map.set(DataType.EMBELLISHMENT, QuestionTemplateRelationEmbellismentForm);
  // map.set(DataType.DATE, QuestionTemplateRelationDateForm);
  // map.set(DataType.FILE_UPLOAD, QuestionTemplateRelationFileUploadForm);
  // map.set(
  //   DataType.SELECTION_FROM_OPTIONS,
  //   QuestionTemplateRelationMultipleChoiceForm
  // );
  // map.set(DataType.TEXT_INPUT, QuestionTemplateRelationTextInputForm);
  // map.set(DataType.SUBTEMPLATE, QuestionTemplateRelationSubtemplateForm);
  // map.set(DataType.SAMPLE_BASIS, QuestionTemplateRelationSampleBasisForm);
  // map.set(DataType.PROPOSAL_BASIS, QuestionTemplateRelationProposalBasisForm);

  if (props.field === null) {
    return null;
  }

  return (
    <StyledModal onClose={props.closeMe} open={props.field != null}>
      {createQuestionTemplateRelationForm({
        field: props.field,
        dispatch: props.dispatch,
        closeMe: props.closeMe,
        template: props.template,
      })}
    </StyledModal>
  );
}
