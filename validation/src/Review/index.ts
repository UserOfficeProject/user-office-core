import * as Yup from 'yup';

import {
  sanitizeHtmlAndCleanText,
  FAP_REVIEW_COMMENT_CHAR_LIMIT,
} from '../util';

const proposalFapReviewCommentValidationSchema = () => {
  let schema = Yup.string().transform(function (value: string) {
    return sanitizeHtmlAndCleanText(value);
  });

  schema = schema
    .max(
      FAP_REVIEW_COMMENT_CHAR_LIMIT,
      `Comment must be at most ${FAP_REVIEW_COMMENT_CHAR_LIMIT} characters`
    )
    .required();

  return schema;
};

export const proposalGradeValidationSchema = Yup.object().shape({
  comment: proposalFapReviewCommentValidationSchema(),
  grade: Yup.string().required(),
});

export const proposalTechnicalReviewValidationSchema = Yup.object().shape({
  status: Yup.string().required(),
  timeAllocation: Yup.number()
    .min(0, ({ min }) => `Must be greater than or equal to ${min}`)
    .max(1e5, ({ max }) => `Must be less than or equal to ${max}`)
    .required('Time allocation is required'),
  comment: Yup.string().nullable(),
  publicComment: Yup.string().nullable(),
});

export const removeUserForReviewValidationSchema = Yup.object().shape({
  reviewID: Yup.number().required(),
});

export const addUserForReviewValidationSchema = Yup.object().shape({
  userID: Yup.number().required(),
  proposalPk: Yup.number().required(),
});

export const submitProposalReviewValidationSchema = Yup.object().shape({
  proposalPk: Yup.number().required('Proposal Primary Key is required'),
  reviewId: Yup.number().required('Review ID is required'),
});
