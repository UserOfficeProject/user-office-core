import React from 'react';

import { DataType, Template, Question } from '../../../generated/sdk';
import { Event } from '../../../models/QuestionaryEditorModel';
import JSDict from '../../../utils/Dictionary';
import ModalWrapper from '../../common/ModalWrapper';
import { QuestionBooleanForm } from './question/QuestionBooleanForm';
import { QuestionDateForm } from './question/QuestionDateForm';
import { QuestionEmbellismentForm } from './question/QuestionEmbellismentForm';
import { QuestionFileUploadForm } from './question/QuestionFileUploadForm';
import { QuestionMultipleChoiceForm } from './question/QuestionMultipleChoiceForm';
import { QuestionSubtemplateForm } from './question/QuestionSubtemplateForm';
import { QuestionTextInputForm } from './question/QuestionTextInputForm';
import { TFormSignature } from './TFormSignature';

export default function QuestionEditor(props: {
  field: Question | null;
  dispatch: React.Dispatch<Event>;
  closeMe: () => void;
  template: Template;
}) {
  const componentMap = JSDict.Create<DataType, TFormSignature<Question>>();
  componentMap.put(DataType.BOOLEAN, QuestionBooleanForm);
  componentMap.put(DataType.EMBELLISHMENT, QuestionEmbellismentForm);
  componentMap.put(DataType.FILE_UPLOAD, QuestionFileUploadForm);
  componentMap.put(DataType.DATE, QuestionDateForm);
  componentMap.put(DataType.SELECTION_FROM_OPTIONS, QuestionMultipleChoiceForm);
  componentMap.put(DataType.TEXT_INPUT, QuestionTextInputForm);
  componentMap.put(DataType.SUBTEMPLATE, QuestionSubtemplateForm);

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
