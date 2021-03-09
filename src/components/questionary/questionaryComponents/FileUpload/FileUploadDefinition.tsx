import AttachFileIcon from '@material-ui/icons/AttachFile';
import React from 'react';
import * as Yup from 'yup';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import FilesAnswerRenderer from './FilesAnswerRenderer';
import FileUploadSearchCriteriaInput from './FileUploadSearchCriteriaInput';
import { QuestionaryComponentFileUpload } from './QuestionaryComponentFileUpload';
import { QuestionFileUploadForm } from './QuestionFileUploadForm';
import { QuestionTemplateRelationFileUploadForm } from './QuestionTemplateRelationFileUploadForm';

export const fileUploadDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.FILE_UPLOAD,
  name: 'File Upload',
  questionaryComponent: QuestionaryComponentFileUpload,
  questionForm: () => QuestionFileUploadForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationFileUploadForm,
  readonly: false,
  creatable: true,
  icon: <AttachFileIcon />,
  renderers: {
    answerRenderer: function AnswerRendererComponent({ answer }) {
      return <FilesAnswerRenderer answer={answer} />;
    },
    questionRenderer: defaultRenderer.questionRenderer,
  },
  createYupValidationSchema: () => Yup.array().of(Yup.string()),
  getYupInitialValue: ({ answer }) => answer.value || [],
  searchCriteriaComponent: FileUploadSearchCriteriaInput,
};
