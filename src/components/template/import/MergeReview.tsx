import { Button, Card, CardContent, Typography } from '@material-ui/core';
import dateformat from 'dateformat';
import produce from 'immer';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import {
  ConflictResolutionStrategy,
  QuestionComparison,
  TemplateImportWithValidation,
} from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { ConflictResolver } from './ConflictResolver';

interface MergeReviewProps {
  data: TemplateImportWithValidation;
  onBack?: () => void;
}

const hasUnresolvedConflicts = (questionComparisons: QuestionComparison[]) =>
  questionComparisons.some(
    (comparison) =>
      comparison.conflictResolutionStrategy ===
      ConflictResolutionStrategy.UNRESOLVED
  );

export function MergeReview(props: MergeReviewProps) {
  const { api } = useDataApiWithFeedback();
  const history = useHistory();
  const templateExport = props.data;
  const { version, json } = templateExport;
  const exportDate = dateformat(templateExport.exportDate, 'dd-mmm-yyyy');

  const [state, setState] = useState({ ...templateExport });

  const onConflictResolved = useCallback(
    (
      comparison: QuestionComparison,
      resolutionStrategy: ConflictResolutionStrategy
    ) => {
      setState(
        produce((draft) => {
          const updateQuestion = draft.questionComparisons.find(
            (curComparison) =>
              comparison.newQuestion.id === curComparison.newQuestion.id
          );
          if (updateQuestion) {
            updateQuestion.conflictResolutionStrategy = resolutionStrategy;
          }
        })
      );
    },
    []
  );

  const handleImportClick = () =>
    api('Template imported successfully')
      .importTemplate({
        templateAsJson: json,
        conflictResolutions: state.questionComparisons.map((comparison) => {
          const question = comparison.newQuestion;

          return {
            questionId: question.id,
            strategy: comparison.conflictResolutionStrategy,
          };
        }),
      })
      .then((result) => {
        if (result.importTemplate.template) {
          history.push(
            `/QuestionaryEditor/${result.importTemplate.template.templateId}`
          );
        }
      });

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="body2">Version: {version}</Typography>
          <Typography variant="body2">Export date: {exportDate}</Typography>
        </CardContent>
      </Card>
      {props.data.questionComparisons.map((comparison) => (
        <ConflictResolver
          key={comparison.newQuestion.id}
          questionComparison={comparison}
          onConflictResolved={onConflictResolved}
        />
      ))}
      <ActionButtonContainer>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => props.onBack?.()}
        >
          Back
        </Button>
        <Button
          data-cy="import-template-button"
          variant="contained"
          color="primary"
          onClick={handleImportClick}
          disabled={hasUnresolvedConflicts(state.questionComparisons)}
        >
          Import
        </Button>
      </ActionButtonContainer>
    </>
  );
}
