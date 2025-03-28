import React, { useEffect } from 'react';

import { useExperimentSafety } from 'hooks/experimentSafety/useExperimentSafety';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import ExperimentSafetyReviewContainer from './ExperimentSafetyReviewContainer';
interface ExperimentSafetyReviewProps {
  experimentSafetyPk: number;
}
export default function ExperimentSafetyReview(
  props: ExperimentSafetyReviewProps
) {
  const { api } = useDataApiWithFeedback();
  const { experimentSafety, loading, setExperimentSafety } =
    useExperimentSafety(props.experimentSafetyPk);

  useEffect(() => {
    // Start the safety review if it has not been started yet
    if (experimentSafety && !experimentSafety.safetyReviewQuestionary) {
      api()
        .startExperimentSafetyReview({
          experimentSafetyPk: experimentSafety.experimentSafetyPk,
        })
        .then((data) => {
          setExperimentSafety(data.startExperimentSafetyReview);
        })
        .catch(() => {
          throw new Error('Failed to start safety review');
        });
    }
  }, [api, experimentSafety, setExperimentSafety]);

  if (loading) {
    return <>Loading...</>;
  }

  if (!experimentSafety) {
    return <>Experiment safety not found</>;
  }

  if (!experimentSafety.safetyReviewQuestionary) {
  }

  return (
    <ExperimentSafetyReviewContainer experimentSafety={experimentSafety} />
  );
}
