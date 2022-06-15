import { Button, Card, CardContent, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import produce from 'immer';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { ConflictResolver, DiffInfo } from 'components/common/ConflictResolver';
import {
  ConflictResolutionStrategy,
  SettingsId,
  UnitComparison,
  UnitsImportWithValidation,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

interface UnitMergeReviewProps {
  data: UnitsImportWithValidation;
  onBack?: () => void;
}

const hasUnresolvedConflicts = (questionComparisons: UnitComparison[]) =>
  questionComparisons.some(
    (comparison) =>
      comparison.conflictResolutionStrategy ===
      ConflictResolutionStrategy.UNRESOLVED
  );

export function UnitMergeReview(props: UnitMergeReviewProps) {
  const { api } = useDataApiWithFeedback();
  const { toFormattedDateTime } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });
  const history = useHistory();
  const templateExport = props.data;
  const { version, json, errors } = templateExport;
  const exportDate = toFormattedDateTime(templateExport.exportDate);

  const [state, setState] = useState({ ...templateExport });

  const onConflictResolved = useCallback(
    (
      comparison: UnitComparison,
      resolutionStrategy: ConflictResolutionStrategy
    ) => {
      setState(
        produce((draft) => {
          const updateQuestion = draft.unitComparisons.find(
            (curComparison) =>
              comparison.newUnit.id === curComparison.newUnit.id
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
    api({ toastSuccessMessage: 'Units imported successfully' })
      .importUnits({
        json,
        conflictResolutions: state.unitComparisons.map(
          ({ newUnit, conflictResolutionStrategy }) => {
            return {
              itemId: newUnit.id,
              strategy: conflictResolutionStrategy,
            };
          }
        ),
      })
      .then(() => history.push('/Units'));

  const getDiffInfo = (comparison: UnitComparison): DiffInfo[] => {
    const { newUnit, existingUnit } = comparison;

    return [
      {
        existingVal: existingUnit?.quantity,
        newVal: newUnit?.quantity ?? '',
        heading: 'Quantity',
        isDifferent:
          existingUnit !== null && existingUnit?.quantity !== newUnit.quantity,
      },
      {
        existingVal: existingUnit?.siConversionFormula,
        newVal: newUnit?.siConversionFormula ?? '',
        heading: 'SI conversion formula',
        isDifferent:
          existingUnit !== null &&
          existingUnit.siConversionFormula !== newUnit.siConversionFormula,
      },
      {
        existingVal: existingUnit?.symbol,
        newVal: newUnit?.symbol ?? '',
        heading: 'Symbol',
        isDifferent:
          existingUnit !== null && existingUnit.symbol !== newUnit.symbol,
      },
      {
        existingVal: existingUnit?.unit,
        newVal: newUnit?.unit ?? '',
        heading: 'Unit',
        isDifferent:
          existingUnit !== null && existingUnit.unit !== newUnit.unit,
      },
    ];
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="body2">Version: {version}</Typography>
          <Typography variant="body2">Export date: {exportDate}</Typography>
        </CardContent>
      </Card>
      {errors.length !== 0 && (
        <Alert severity="warning">
          {errors.map((error) => (
            <Typography key={error}>{error}</Typography>
          ))}
        </Alert>
      )}

      {props.data.unitComparisons.map((comparison) => (
        <ConflictResolver<UnitComparison>
          key={comparison.newUnit.id}
          comparison={comparison}
          onConflictResolved={onConflictResolved}
          getStatus={(comparison) => comparison.status}
          getItemId={(comparison) => comparison.newUnit.id}
          getItemTitle={(comparison) => comparison.newUnit.unit}
          getDiffInfo={getDiffInfo}
        />
      ))}
      <ActionButtonContainer>
        <Button
          data-cy="back-button"
          variant="outlined"
          onClick={() => props.onBack?.()}
        >
          Back
        </Button>
        <Button
          data-cy="import-units-button"
          onClick={handleImportClick}
          disabled={hasUnresolvedConflicts(state.unitComparisons)}
        >
          Import
        </Button>
      </ActionButtonContainer>
    </>
  );
}
