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
    api()
      .reviewExperimentSafety({
        experimentSafetyPk: props.experimentSafetyPk,
      })
      .then((data) => {
        setExperimentSafety(data.reviewExperimentSafety);
      })
      .catch(() => {
        throw new Error('Failed to start safety review');
      });
  }, [api, props.experimentSafetyPk, setExperimentSafety]);

  if (loading) {
    return <>Loading...</>;
  }

  if (!experimentSafety) {
    return <>Experiment safety not found</>;
  }

  if (!experimentSafety?.safetyReviewQuestionary) {
    return <>Safety Review Not Available</>;
  }

  return (
    <ExperimentSafetyReviewContainer experimentSafety={experimentSafety} />
  );
}
