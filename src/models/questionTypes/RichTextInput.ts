import { richTextInputQuestionValidationSchema } from '@esss-swap/duo-validation';
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
  ],
  disallowedTagsMode: 'discard',
  allowedAttributes: {
    a: ['href', 'title'],
    span: ['style'],
    p: ['style'],
  },
  allowedStyles: {
    '*': {
      color: [
        /^#(0x)?[0-9a-f]+$/i, // hex
        /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i, // rgb
      ],
      'text-align': [/^left$/i, /^right$/i, /^center$/i, /^justify$/i],
      'font-size': [/^\d+(?:px|em|%)$/i],
      'text-decoration': [/^underline$/i, /^line-through$/i],
    },
  },
  selfClosing: [],
  allowedSchemes: [],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: [],
};

export const richTextInputDefinition: Question = {
  dataType: DataType.RICH_TEXT_INPUT,
  validate: (field: QuestionTemplateRelation, value: any) => {
    if (field.question.dataType !== DataType.RICH_TEXT_INPUT) {
      throw new Error('DataType should be RICH_TEXT_INPUT');
    }

    return richTextInputQuestionValidationSchema(field).isValidSync(value);
  },
  transform: (field: QuestionTemplateRelation, value: any) =>
    sanitizeHtml(value, sanitizerConfig),
  createBlankConfig: (): ConfigBase => {
    const config = new RichTextInputConfig();
    config.required = false;
    config.small_label = '';
    config.tooltip = '';
    config.max = null;

    return config;
  },
  getDefaultAnswer: () => '',
};
