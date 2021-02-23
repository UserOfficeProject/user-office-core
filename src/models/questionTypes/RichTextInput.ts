/* eslint-disable @typescript-eslint/camelcase */
import sanitizeHtml, { IOptions } from 'sanitize-html';

import {
  ConfigBase,
  RichTextInputConfig,
} from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

// explicitly limit the accepted elements, attributes, styles
const sanitizerConfig: IOptions = {
  allowedTags: [
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

// options to remove all html tags and get only text characters count
const sanitizerValidationConfig: IOptions = {
  allowedTags: [],
  disallowedTagsMode: 'discard',
  allowedAttributes: {},
  allowedStyles: {},
  selfClosing: [],
  allowedSchemes: [],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: [],
};

const sanitizeAndCleanHtmlTags = (htmlString: string) => {
  const sanitized = sanitizeHtml(htmlString, sanitizerValidationConfig);

  /**
   * NOTE:
   * 1. Remove all newline characters from counting.
   * 2. Replace the surrogate pairs(emojis) with _ and count them as one character instead of two ("😀".length = 2).
   *    https://stackoverflow.com/questions/31986614/what-is-a-surrogate-pair
   */
  const sanitizedCleaned = sanitized
    .replace(/(\r\n|\n|\r)/gm, '')
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '_')
    .trim();

  return sanitizedCleaned;
};

export const richTextInputDefinition: Question = {
  dataType: DataType.RICH_TEXT_INPUT,
  validate: (field: QuestionTemplateRelation, value: any) => {
    if (field.question.dataType !== DataType.RICH_TEXT_INPUT) {
      throw new Error('DataType should be RICH_TEXT_INPUT');
    }
    const config = field.config as RichTextInputConfig;
    if (config.required && !value) {
      return false;
    }

    if (
      config.max &&
      value &&
      sanitizeAndCleanHtmlTags(value).length > config.max
    ) {
      return false;
    }

    return true;
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
  isReadOnly: false,
  getDefaultAnswer: () => '',
};
