import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import React from 'react';

import { DataType } from '../../../../generated/sdk';
import defaultRenderer from '../../DefaultQuestionRenderer';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { createMultiPartSelectionValidationSchema } from './createMultiPartSelectionValidationSchema';
import MultiPartSelectionAnswerRenderer from './MultiPartSelectionAnswerRenderer';
import MultiPartSelectionSearchCriteriaComponent from './MultiPartSelectionSearchCriteriaComponent';
import { QuestionaryComponentMultiPartSelection } from './QuestionaryComponentMultiPartSelection';
import { QuestionMultiPartSelectionForm } from './QuestionMultiPartSelectionForm';
import { QuestionTemplateRelationMultiPartSelectionForm } from './QuestionTemplateRelationMultiPartSelectionForm';

export const multiPartSelectionDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.MULTI_PART_SELECTION,
  name: 'Multi part selection',
  questionaryComponent: QuestionaryComponentMultiPartSelection,
  questionForm: () => QuestionMultiPartSelectionForm,
  questionTemplateRelationForm: () =>
    QuestionTemplateRelationMultiPartSelectionForm,
  readonly: false,
  creatable: true,
  icon: <RadioButtonCheckedIcon />,
  renderers: {
    answerRenderer: MultiPartSelectionAnswerRenderer, // add
    questionRenderer: defaultRenderer.questionRenderer,
  },
  createYupValidationSchema: createMultiPartSelectionValidationSchema, // add
  getYupInitialValue: ({ answer }) =>
    answer.value || { partOneAnswer: '', partTwoAnswer: '' },
  searchCriteriaComponent: MultiPartSelectionSearchCriteriaComponent, // add,
};
