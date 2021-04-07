import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { RichTextInputConfig } from 'generated/sdk';

const getRawTextFromHtml = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;

  return div.textContent || div.innerText || '';
};

const stripHtmlTagsAndCleanText = (htmlString: string) => {
  // NOTE: Get raw text from html
  const rawText = getRawTextFromHtml(htmlString);

  /**
   * NOTE:
   * 1. Remove all newline characters from counting.
   * 2. Replace the surrogate pairs(emojis) with _ and count them as one character instead of two ("😀".length = 2).
   *    https://stackoverflow.com/questions/31986614/what-is-a-surrogate-pair
   */
  const strippedCleanedText = rawText
    .replace(/(\r\n|\n|\r)/gm, '')
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '_')
    .trim();

  return strippedCleanedText;
};

export const createRichTextInputValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] = (
  answer
) => {
  let schema = Yup.string().transform(function (value: string) {
    return stripHtmlTagsAndCleanText(value);
  });

  const config = answer.config as RichTextInputConfig;

  if (config.required) {
    schema = schema.required(`This is a required field`);
  }

  if (config.max) {
    schema = schema.max(
      config.max,
      `Value must be at most ${config.max} characters`
    );
  }

  return schema;
};
