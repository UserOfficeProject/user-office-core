import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import React from 'react';
import * as Yup from 'yup';

import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { QuestionaryComponentSampleDeclaration } from './QuestionaryComponentSampleDeclaration';
import { QuestionSubtemplateForm } from './QuestionSubtemplateForm';
import { QuestionTemplateRelationSubtemplateForm } from './QuestionTemplateRelationSubtemplateForm';
import SamplesAnswerRenderer from './SamplesAnswerRenderer';

export const sampleDeclarationDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.SAMPLE_DECLARATION,
  name: 'Sample Declaration',
  questionaryComponent: QuestionaryComponentSampleDeclaration,
  questionForm: () => QuestionSubtemplateForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationSubtemplateForm,
  readonly: false,
  creatable: true,
  icon: <CheckBoxOutlineBlankIcon />,
  answerRenderer: ({ answer }) => <SamplesAnswerRenderer answer={answer} />,
  createYupValidationSchema: answer => {
    const schema = Yup.object().shape({});

    return schema;
  },
};
