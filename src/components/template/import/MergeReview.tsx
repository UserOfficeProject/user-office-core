import { Box, Button, Typography } from '@mui/material';
import produce from 'immer';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import {
  ConflictResolutionStrategy,
  QuestionComparison,
  SettingsId,
  TemplateValidation,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { QuestionComparisonList } from './QuestionComparisonList';

interface MergeReviewProps {
  templateImport: TemplateValidation;
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

  const { templateImport, onBack } = props;
  const { version, json } = templateImport;
  const exportDate = toFormattedDateTime(templateImport.exportDate);

  const [state, setState] = useState({ ...templateImport });

  const onConflictResolved = useCallback(
    (
      comparison: QuestionComparison,
      resolutionStrategy: ConflictResolutionStrategy
    ) => {
      setState(
        produce((draft) => {
          const updateQuestion = draft.validationData.questionComparisons.find(
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

  const onConflictResolvedSubTemplate = useCallback(
    (
      comparison: QuestionComparison,
      resolutionStrategy: ConflictResolutionStrategy
    ) => {
      setState(
        produce((draft) => {
          const updateTemplate =
            draft.validationData.subTemplateValidationData?.find((template) =>
              template.questionComparisons.find(
                (curComparison) =>
                  comparison.newQuestion.id === curComparison.newQuestion.id
              )
            );
          const updateQuestion = updateTemplate?.questionComparisons.find(
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
    api({ toastSuccessMessage: 'Template imported successfully' })
      .importTemplate({
        templateAsJson: json,
        conflictResolutions: state.validationData.questionComparisons.map(
          (comparison) => {
            const question = comparison.newQuestion;

            return {
              itemId: question.id,
              strategy: comparison.conflictResolutionStrategy,
            };
          }
        ),
        subTemplatesConflictResolutions:
          state.validationData.subTemplateValidationData.map((template) => {
            return template.questionComparisons.map((comparison) => {
              const question = comparison.newQuestion;

              return {
                itemId: question.id,
                strategy: comparison.conflictResolutionStrategy,
              };
            });
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
      <Box sx={{ padding: 1 }}>
        <Typography component="h3">Version: {version}</Typography>
        <Typography component="h3">Export date: {exportDate}</Typography>
      </Box>
      <QuestionComparisonList
        comparisons={templateImport.validationData.questionComparisons}
        onConflictResolved={onConflictResolved}
      />

      {templateImport.validationData.subTemplateValidationData.length > 0 && (
        <>
          <Box sx={{ padding: 1, paddingTop: 3 }}>
            <Typography component="h3">
              Sub Templates and Sample Questions:
            </Typography>
          </Box>
          <QuestionComparisonList
            comparisons={templateImport.validationData.subTemplateValidationData
              .map((template) => template.questionComparisons)
              .flat()}
            onConflictResolved={onConflictResolvedSubTemplate}
          />
        </>
      )}
      <ActionButtonContainer>
        <Button variant="outlined" onClick={() => onBack?.()}>
          Back
        </Button>
        <Button
          data-cy="import-template-button"
          onClick={handleImportClick}
          disabled={hasUnresolvedConflicts(
            state.validationData.questionComparisons
          )}
        >
          Import
        </Button>
      </ActionButtonContainer>
    </>
  );
}

export default MergeReview;
