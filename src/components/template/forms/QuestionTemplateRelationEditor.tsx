import React from 'react';

import ModalWrapper from 'components/common/ModalWrapper';
import { DataType, Template, QuestionTemplateRelation } from 'generated/sdk';
import { Event } from 'models/QuestionaryEditorModel';

import { QuestionTemplateRelationBooleanForm } from './questionRel/QuestionTemplateRelationBooleanForm';
import { QuestionTemplateRelationDateForm } from './questionRel/QuestionTemplateRelationDateForm';
import { QuestionTemplateRelationEmbellismentForm } from './questionRel/QuestionTemplateRelationEmbellismentForm';
import { QuestionTemplateRelationFileUploadForm } from './questionRel/QuestionTemplateRelationFileUploadForm';
import { QuestionTemplateRelationMultipleChoiceForm } from './questionRel/QuestionTemplateRelationMultipleChoiceForm';
import { QuestionTemplateRelationSampleBasisForm } from './questionRel/QuestionTemplateRelationSampleBasisForm';
import { QuestionTemplateRelationSubtemplateForm } from './questionRel/QuestionTemplateRelationSubtemplateForm';
import { QuestionTemplateRelationTextInputForm } from './questionRel/QuestionTemplateRelationTextInputForm';
import { TFormSignature } from './TFormSignature';

export default function QuestionTemplateRelationEditor(props: {
  field: QuestionTemplateRelation | null;
  dispatch: React.Dispatch<Event>;
  closeMe: () => void;
  template: Template;
}) {
  const map = new Map<DataType, TFormSignature<QuestionTemplateRelation>>();
  map.set(DataType.BOOLEAN, QuestionTemplateRelationBooleanForm);
  map.set(DataType.EMBELLISHMENT, QuestionTemplateRelationEmbellismentForm);
  map.set(DataType.DATE, QuestionTemplateRelationDateForm);
  map.set(DataType.FILE_UPLOAD, QuestionTemplateRelationFileUploadForm);
  map.set(
    DataType.SELECTION_FROM_OPTIONS,
    QuestionTemplateRelationMultipleChoiceForm
  );
  map.set(DataType.TEXT_INPUT, QuestionTemplateRelationTextInputForm);
  map.set(DataType.SUBTEMPLATE, QuestionTemplateRelationSubtemplateForm);
  map.set(DataType.SAMPLE_BASIS, QuestionTemplateRelationSampleBasisForm);

  if (props.field === null) {
    return null;
  }

  return (
    <ModalWrapper close={props.closeMe} isOpen={props.field != null}>
      {React.createElement(map.get(props.field.question.dataType)!, {
        field: props.field,
        dispatch: props.dispatch,
        closeMe: props.closeMe,
        template: props.template,
      })}
    </ModalWrapper>
  );
}
