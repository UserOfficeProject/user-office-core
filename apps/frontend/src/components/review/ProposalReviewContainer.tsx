import Box from '@mui/material/Box';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { useReviewData } from 'hooks/review/useReviewData';

import ReviewQuestionary from './ReviewQuestionary';

interface ReviewQuestionaryProps {
  reviewId?: number | null;
  fapId?: number | null;
}
export default function ProposalReviewContainer({
  fapId,
  reviewId,
}: ReviewQuestionaryProps) {
  const { reviewData, loading } = useReviewData(reviewId, fapId);

  if (loading) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  if (!reviewData) {
    return <Box>Review not found</Box>;
  }

  return <ReviewQuestionary review={reviewData} />;
}
