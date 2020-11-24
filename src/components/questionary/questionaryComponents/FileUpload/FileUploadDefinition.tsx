import AttachFileIcon from '@material-ui/icons/AttachFile';
import React from 'react';
import * as Yup from 'yup';

import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import FilesAnswerRenderer from './FilesAnswerRenderer';
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
  answerRenderer: ({ answer }) => <FilesAnswerRenderer answer={answer} />,
  createYupValidationSchema: answer => Yup.array().of(Yup.string()),
};
