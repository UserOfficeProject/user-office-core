import { richTextInputQuestionValidationSchema } from '@user-office-software/duo-validation';
import { GraphQLError } from 'graphql';
import sanitizeHtml, { IOptions } from 'sanitize-html';

import {
  ConfigBase,
  RichTextInputConfig,
} from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

// explicitly limit the accepted elements, attributes, styles
export const sanitizerConfig: IOptions = {
  allowedTags: [
    'a',
    'p',
    'span',
    'strong',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'sub',
    'sup',
    'pre',
    'ul',
    'ol',
    'li',
    'div',
    'br',
    'img',
  ],
  disallowedTagsMode: 'discard',
  allowedAttributes: {
    a: ['href', 'title'],
    span: ['style'],
    p: ['style'],
    div: ['style'],
  },
  selfClosing: [],
  allowedSchemes: [],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: [],
};

export const sanitizerConfigWithImages: IOptions = {
  ...sanitizerConfig,
  allowedAttributes: {
    a: ['href', 'title'],
    span: ['style', 'class'],
    p: ['style'],
    div: ['style'],
    img: ['src', 'alt', 'data-mce-src'],
  },
};

export const richTextInputDefinition: Question<DataType.RICH_TEXT_INPUT> = {
  dataType: DataType.RICH_TEXT_INPUT,
  validate: (field: QuestionTemplateRelation, value: any) => {
    if (field.question.dataType !== DataType.RICH_TEXT_INPUT) {
      throw new GraphQLError('DataType should be RICH_TEXT_INPUT');
    }

    return richTextInputQuestionValidationSchema(field).isValid(value);
  },
  transform: (field: QuestionTemplateRelation, value: any) => {
    const config = field.config as RichTextInputConfig;
    const s = config.allowImages ? sanitizerConfigWithImages : sanitizerConfig;

    const r = sanitizeHtml(
      value,
      config.allowImages ? sanitizerConfigWithImages : sanitizerConfig
    );

    return r;
  },
  createBlankConfig: (): ConfigBase => {
    const config = new RichTextInputConfig();
    config.required = false;
    config.small_label = '';
    config.tooltip = '';
    config.max = null;
    config.allowImages = false;

    return config;
  },
  getDefaultAnswer: () => '',
};
