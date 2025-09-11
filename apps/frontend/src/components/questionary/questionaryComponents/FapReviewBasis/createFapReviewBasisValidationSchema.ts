import { sanitizeHtmlAndCleanText } from '@user-office-software/duo-validation/lib/util';
import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { Answer, FapReviewBasisConfig } from 'generated/sdk';

export const createFapReviewBasisValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] =
  (answer: Answer) => {
    const FAP_REVIEW_COMMENT_CHAR_LIMIT = 6000;

    const config = answer.config as FapReviewBasisConfig;

    let commentSchema = Yup.string().transform(function (value: string) {
      return sanitizeHtmlAndCleanText(value);
    });

    commentSchema = commentSchema
      .max(
        FAP_REVIEW_COMMENT_CHAR_LIMIT,
        `Comment must be at most ${FAP_REVIEW_COMMENT_CHAR_LIMIT} characters`
      )
      .required('Comment is required');

    const schema = Yup.object().shape({
      comment: commentSchema,
      grade: Yup.string()
        .test('min', `Lowest grade is ${config.minGrade}`, (val) => {
          if (val === undefined) return false;

          const number = parseFloat(val);

          return isNaN(number) ? true : number >= config.minGrade;
        })
        .test('max', `Lowest grade is ${config.maxGrade}`, (val) => {
          if (val === undefined) return false;

          const number = parseFloat(val);

          return isNaN(number) ? true : number <= config.maxGrade;
        })
        .test(
          'decimatePoint',
          `The grade must be a most ${config.decimalPoints} dp`,
          (val) => {
            if (val === undefined) return false;

            const number = parseFloat(val);

            const decimalPlaces = (val.split('.')[1] || '').length;

            return isNaN(number) ? true : decimalPlaces <= config.decimalPoints;
          }
        )
        .test('nonNumericOptions', 'Invalid option', (val) => {
          if (val === undefined) return false;

          const number = parseFloat(val);

          return isNaN(number) ? config.nonNumericOptions.includes(val) : true;
        })
        .required('Grade is required'),
    });

    return schema;
  };
