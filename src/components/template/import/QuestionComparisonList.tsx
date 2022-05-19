import React from 'react';

import { ConflictResolutionStrategy, QuestionComparison } from 'generated/sdk';
import { deepEqual } from 'utils/json';

import { ConflictResolver, DiffInfo } from '../../common/ConflictResolver';

const getDiffInfo = ({
  existingQuestion,
  newQuestion,
}: QuestionComparison): DiffInfo[] => [
  {
    existingVal: existingQuestion?.naturalKey,
    newVal: newQuestion?.naturalKey ?? '',
    heading: 'Natural key',
    isDifferent:
      existingQuestion !== null &&
      existingQuestion?.naturalKey !== newQuestion.naturalKey,
  },
  {
    existingVal: existingQuestion?.question,
    newVal: newQuestion?.question ?? '',
    heading: 'Question',
    isDifferent:
      existingQuestion !== null &&
      existingQuestion.question !== newQuestion.question,
  },
  {
    existingVal: (
      <pre>{JSON.stringify(existingQuestion?.config, undefined, 4) || '-'}</pre>
    ),
    newVal: <pre>{JSON.stringify(newQuestion?.config, undefined, 4)}</pre>,
    heading: 'Config',
    isDifferent:
      existingQuestion !== null &&
      deepEqual(existingQuestion?.config, newQuestion.config) === false,
  },
];

interface QuestionComparisonListProps {
  comparisons: QuestionComparison[];
  onConflictResolved: (
    comparison: QuestionComparison,
    resolutionStrategy: ConflictResolutionStrategy
  ) => void;
}

export function QuestionComparisonList(props: QuestionComparisonListProps) {
  const { comparisons, onConflictResolved } = props;

  return (
    <>
      {comparisons.map((comparison) => (
        <ConflictResolver<QuestionComparison>
          key={comparison.newQuestion.id}
          comparison={comparison}
          onConflictResolved={onConflictResolved}
          getStatus={(comparison) => comparison.status}
          getItemId={(comparison) => comparison.newQuestion.id}
          getItemTitle={(comparison) => comparison.newQuestion.question}
          getDiffInfo={getDiffInfo}
        />
      ))}
    </>
  );
}
