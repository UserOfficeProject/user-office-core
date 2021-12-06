import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { useFeedback } from 'hooks/feedback/useFeedback';
import { FeedbackCore } from 'models/questionary/feedback/FeedbackCore';

import FeedbackContainer from './FeedbackContainer';

interface UpdateFeedbackProps {
  feedbackId: number;
  onUpdate?: (feedback: FeedbackCore) => void;
  onSubmitted?: (feedback: FeedbackCore) => void;
}

function UpdateFeedback({
  feedbackId,
  onUpdate,
  onSubmitted,
}: UpdateFeedbackProps) {
  const { feedback } = useFeedback(feedbackId);

  if (!feedback) {
    return <UOLoader />;
  }

  return (
    <FeedbackContainer
      feedback={feedback}
      onUpdate={onUpdate}
      onSubmitted={onSubmitted}
    />
  );
}

export default UpdateFeedback;
