import React from 'react';

import { useExperimentSafety } from 'hooks/experimentSafety/useExperimentSafety';
interface ExperimentSafetyReviewProps {
  experimentSafetyPk: number;
}
export default function ExperimentSafetyReview(
  props: ExperimentSafetyReviewProps
) {
  const { experimentSafety, loading } = useExperimentSafety(
    props.experimentSafetyPk
  );

  if (loading) {
    return <>Loading...</>;
  }

  if (!experimentSafety) {
    return <>Experiment safety not found</>;
  }

  return <>HOLA!!! {experimentSafety.experimentSafetyPk}</>;
}
