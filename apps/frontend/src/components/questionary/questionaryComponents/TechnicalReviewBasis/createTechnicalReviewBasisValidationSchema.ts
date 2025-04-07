import { sanitizeHtmlAndCleanText } from '@user-office-software/duo-validation/lib/util';
import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';

export const createTechnicalReviewBasisValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] =
  () => {
    const TECHNICAL_REVIEW_COMMENT_CHAR_LIMIT = 6000;
    const TECHNICAL_REVIEW_PUBLIC_COMMENT_CHAR_LIMIT = 6000;

    const statusSchema = Yup.string().required('Status is required');

    const timeAllocationSchema = Yup.number()
      .min(0, 'Must be greater than or equal to 0')
      .max(100000, 'Must be less than or equal to 100000')
      .nullable();

    let commentSchema = Yup.string().transform(function (value: string) {
      return sanitizeHtmlAndCleanText(value);
    });

    let publicCommentSchema = Yup.string().transform(function (value: string) {
      return sanitizeHtmlAndCleanText(value);
    });

    commentSchema = commentSchema.max(
      TECHNICAL_REVIEW_COMMENT_CHAR_LIMIT,
      `Comment must be at most ${TECHNICAL_REVIEW_COMMENT_CHAR_LIMIT} characters`
    );

    publicCommentSchema = publicCommentSchema.max(
      TECHNICAL_REVIEW_PUBLIC_COMMENT_CHAR_LIMIT,
      `Public comment must be at most ${TECHNICAL_REVIEW_PUBLIC_COMMENT_CHAR_LIMIT} characters`
    );

    const schema = Yup.object().shape({
      status: statusSchema,
      timeAllocation: timeAllocationSchema,
      comment: commentSchema,
      publicCommentSchema: publicCommentSchema,
    });

    return schema;
  };
