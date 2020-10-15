import React from 'react';

import ModalWrapper from 'components/common/ModalWrapper';
import { DataType, Question, Template } from 'generated/sdk';
import { Event } from 'models/QuestionaryEditorModel';

import { QuestionBooleanForm } from './question/QuestionBooleanForm';
import { QuestionDateForm } from './question/QuestionDateForm';
import { QuestionEmbellismentForm } from './question/QuestionEmbellismentForm';
import { QuestionFileUploadForm } from './question/QuestionFileUploadForm';
import { QuestionMultipleChoiceForm } from './question/QuestionMultipleChoiceForm';
import { QuestionProposalBasisForm } from './question/QuestionProposalBasisForm';
import { QuestionSampleBasisForm } from './question/QuestionSampleBasisForm';
import { QuestionSubtemplateForm } from './question/QuestionSubtemplateForm';
import { QuestionTextInputForm } from './question/QuestionTextInputForm';
import { TFormSignature } from './TFormSignature';

export default function QuestionEditor(props: {
  field: Question | null;
  dispatch: React.Dispatch<Event>;
  closeMe: () => void;
  template: Template;
}) {
  const componentMap = new Map<DataType, TFormSignature<Question>>();
  componentMap.set(DataType.BOOLEAN, QuestionBooleanForm);
  componentMap.set(DataType.EMBELLISHMENT, QuestionEmbellismentForm);
  componentMap.set(DataType.FILE_UPLOAD, QuestionFileUploadForm);
  componentMap.set(DataType.DATE, QuestionDateForm);
  componentMap.set(DataType.SELECTION_FROM_OPTIONS, QuestionMultipleChoiceForm);
  componentMap.set(DataType.TEXT_INPUT, QuestionTextInputForm);
  componentMap.set(DataType.SUBTEMPLATE, QuestionSubtemplateForm);
  componentMap.set(DataType.SAMPLE_BASIS, QuestionSampleBasisForm);
  componentMap.set(DataType.PROPOSAL_BASIS, QuestionProposalBasisForm);

  if (props.field === null) {
    return null;
  }

  return (
    <ModalWrapper close={props.closeMe} isOpen={props.field != null}>
      {React.createElement(componentMap.get(props.field.dataType)!, {
        field: props.field,
        dispatch: props.dispatch,
        closeMe: props.closeMe,
        template: props.template,
      })}
    </ModalWrapper>
  );
}
