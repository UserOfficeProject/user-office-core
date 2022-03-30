import { Button, Card, CardContent, Typography } from '@mui/material';
import produce from 'immer';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import {
  ConflictResolutionStrategy,
  QuestionComparison,
  SettingsId,
  TemplateImportWithValidation,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { deepEqual } from 'utils/json';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { ConflictResolver } from '../../common/ConflictResolver';

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
  const { toFormattedDateTime } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });
  const templateExport = props.data;
  const { version, json } = templateExport;
  const exportDate = toFormattedDateTime(templateExport.exportDate);

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
            itemId: question.id,
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
        <ConflictResolver<QuestionComparison>
          key={comparison.newQuestion.id}
          comparison={comparison}
          onConflictResolved={onConflictResolved}
          getStatus={(comparison) => comparison.status}
          getItemId={(comparison) => comparison.newQuestion.id}
          getItemTitle={(comparison) => comparison.newQuestion.question}
          getDiffInfo={({ existingQuestion, newQuestion }) => {
            return [
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
                  <pre>
                    {JSON.stringify(existingQuestion?.config, undefined, 4) ||
                      '-'}
                  </pre>
                ),
                newVal: (
                  <pre>{JSON.stringify(newQuestion?.config, undefined, 4)}</pre>
                ),
                heading: 'Config',
                isDifferent:
                  existingQuestion !== null &&
                  deepEqual(existingQuestion?.config, newQuestion.config) ===
                    false,
              },
            ];
          }}
        />
      ))}
      <ActionButtonContainer>
        <Button variant="outlined" onClick={() => props.onBack?.()}>
          Back
        </Button>
        <Button
          data-cy="import-template-button"
          onClick={handleImportClick}
          disabled={hasUnresolvedConflicts(state.questionComparisons)}
        >
          Import
        </Button>
      </ActionButtonContainer>
    </>
  );
}
