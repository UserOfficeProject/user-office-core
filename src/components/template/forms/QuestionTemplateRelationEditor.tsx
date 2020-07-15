import React from 'react';

import ModalWrapper from 'components/common/ModalWrapper';
import { DataType, Template, QuestionTemplateRelation } from 'generated/sdk';
import { Event } from 'models/QuestionaryEditorModel';
import JSDict from 'utils/Dictionary';

import { QuestionTemplateRelationBooleanForm } from './questionRel/QuestionTemplateRelationBooleanForm';
import { QuestionTemplateRelationDateForm } from './questionRel/QuestionTemplateRelationDateForm';
import { QuestionTemplateRelationEmbellismentForm } from './questionRel/QuestionTemplateRelationEmbellismentForm';
import { QuestionTemplateRelationFileUploadForm } from './questionRel/QuestionTemplateRelationFileUploadForm';
import { QuestionTemplateRelationMultipleChoiceForm } from './questionRel/QuestionTemplateRelationMultipleChoiceForm';
import { QuestionTemplateRelationSubtemplateForm } from './questionRel/QuestionTemplateRelationSubtemplateForm';
import { QuestionTemplateRelationTextInputForm } from './questionRel/QuestionTemplateRelationTextInputForm';
import { TFormSignature } from './TFormSignature';

export default function QuestionTemplateRelationEditor(props: {
  field: QuestionTemplateRelation | null;
  dispatch: React.Dispatch<Event>;
  closeMe: () => void;
  template: Template;
}) {
  const componentMap = JSDict.Create<
    DataType,
    TFormSignature<QuestionTemplateRelation>
  >();
  componentMap.put(DataType.BOOLEAN, QuestionTemplateRelationBooleanForm);
  componentMap.put(
    DataType.EMBELLISHMENT,
    QuestionTemplateRelationEmbellismentForm
  );
  componentMap.put(DataType.DATE, QuestionTemplateRelationDateForm);
  componentMap.put(
    DataType.FILE_UPLOAD,
    QuestionTemplateRelationFileUploadForm
  );
  componentMap.put(
    DataType.SELECTION_FROM_OPTIONS,
    QuestionTemplateRelationMultipleChoiceForm
  );
  componentMap.put(DataType.TEXT_INPUT, QuestionTemplateRelationTextInputForm);
  componentMap.put(
    DataType.SUBTEMPLATE,
    QuestionTemplateRelationSubtemplateForm
  );

  if (props.field === null) {
    return null;
  }

  return (
    <ModalWrapper close={props.closeMe} isOpen={props.field != null}>
      {React.createElement(componentMap.get(props.field.question.dataType)!, {
        field: props.field,
        dispatch: props.dispatch,
        closeMe: props.closeMe,
        template: props.template,
      })}
    </ModalWrapper>
  );
}
