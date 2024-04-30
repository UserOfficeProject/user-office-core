import AttachFileIcon from '@mui/icons-material/AttachFile';
import { fileUploadQuestionValidationSchema } from '@user-office-software/duo-validation';
import React from 'react';

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
    answerRenderer: FilesAnswerRenderer,
    questionRenderer: defaultRenderer.questionRenderer,
  },
  createYupValidationSchema: fileUploadQuestionValidationSchema,
  getYupInitialValue: ({ answer }) => answer.value || [],
  searchCriteriaComponent: FileUploadSearchCriteriaInput,
};
