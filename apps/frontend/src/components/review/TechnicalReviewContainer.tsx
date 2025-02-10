import Box from '@mui/material/Box';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { CoreTechnicalReviewFragment, TechnicalReview } from 'generated/sdk';
import { useTechnicalReviewData } from 'hooks/technicalReview/useTechnicalReviewData';

import TechnicalReviewQuestionary from './TechnicalReviewQuestionary';

interface TechnicalReviewQuestionaryProps {
  technicalReview: CoreTechnicalReviewFragment | null;
  technicalReviewUpdated: (technicalReview: TechnicalReview) => void;
}
export default function TechnicalReviewContainer({
  technicalReview,
  technicalReviewUpdated,
}: TechnicalReviewQuestionaryProps) {
  const { technicalReviewData, loading } = useTechnicalReviewData(
    technicalReview?.id
  );

  if (loading) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  if (!technicalReviewData) {
    return <Box>Technical Review not found</Box>;
  }

  return (
    <TechnicalReviewQuestionary
      technicalReview={technicalReviewData}
      technicalReviewUpdated={technicalReviewUpdated}
    />
  );
}
