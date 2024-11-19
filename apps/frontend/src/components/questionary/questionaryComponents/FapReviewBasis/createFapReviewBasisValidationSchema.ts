import { sanitizeHtmlAndCleanText } from '@user-office-software/duo-validation/lib/util';
import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';

export const createFapReviewBasisValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] =
  () => {
    const FAP_REVIEW_COMMENT_CHAR_LIMIT = 6000;

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
      grade: Yup.number()
        .min(1, 'Lowest grade is 1')
        .max(10, 'Highest grade is 10')
        .required('Grade is required'),
    });

    return schema;
  };
