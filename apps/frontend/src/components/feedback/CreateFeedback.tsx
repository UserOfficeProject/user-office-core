import Alert from '@mui/material/Alert';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { useBlankFeedback } from 'hooks/feedback/useBlankFeedback';

import FeedbackContainer from './FeedbackContainer';

interface CreateFeedbackProps {
  experimentPk: number;
}
function CreateFeedback({ experimentPk }: CreateFeedbackProps) {
  const { blankFeedback, error: blankFeedbackError } =
    useBlankFeedback(experimentPk);

  if (blankFeedbackError) {
    return (
      <Alert severity="error">
        <strong>Error:</strong>
        {blankFeedbackError}
      </Alert>
    );
  }

  if (!blankFeedback) {
    return <UOLoader />;
  }

  return <FeedbackContainer feedback={blankFeedback} />;
}

export default CreateFeedback;
