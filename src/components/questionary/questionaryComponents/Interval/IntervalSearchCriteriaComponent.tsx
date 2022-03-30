import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';

import { SearchCriteriaInputProps } from 'components/proposal/SearchCriteriaInputProps';
import {
  IntervalConfig,
  QuestionFilterCompareOperator,
  Unit,
} from 'generated/sdk';
import { convertToSi } from 'utils/expressionToFunction';

function IntervalSearchCriteriaComponent({
  onChange,
  searchCriteria,
  questionTemplateRelation,
}: SearchCriteriaInputProps) {
  const [value, setValue] = useState(searchCriteria?.value ?? '');
  const [comparator, setComparator] = useState<QuestionFilterCompareOperator>(
    (searchCriteria?.compareOperator as QuestionFilterCompareOperator) ??
      QuestionFilterCompareOperator.GREATER_THAN
  );

  const availableUnits = (questionTemplateRelation.config as IntervalConfig)
    .units;
  const [unit, setUnit] = useState<Unit | null>(availableUnits[0] ?? null);

  return (
    <Grid container spacing={2}>
      <Grid item xs={5}>
        <FormControl fullWidth>
          <InputLabel shrink id="comparator-label">
            Operator
          </InputLabel>
          <Select
            labelId="comparator-label"
            onChange={(event) => {
              const newComparator = event.target
                .value as QuestionFilterCompareOperator;
              setComparator(newComparator);
              onChange(newComparator, convertToSi(value as number, unit));
            }}
            value={comparator}
            data-cy="comparator"
          >
            <MenuItem key="lt" value={QuestionFilterCompareOperator.LESS_THAN}>
              Less than
            </MenuItem>
            <MenuItem
              key="gt"
              value={QuestionFilterCompareOperator.GREATER_THAN}
            >
              Greater than
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={3}>
        <TextField
          name="value"
          label="Value"
          margin="none"
          type="number"
          value={value}
          fullWidth
          onChange={(e) => setValue(e.target.value)}
          onBlur={() =>
            onChange(comparator, convertToSi(value as number, unit))
          }
          data-cy="value"
        />
      </Grid>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel shrink id="unit-label">
            Unit
          </InputLabel>
          <Select
            labelId="unit-label"
            onChange={(unit) => {
              const selectedUnit = availableUnits.find(
                (availableUnit) => availableUnit.id === unit.target.value
              )!;
              setUnit(selectedUnit);
              onChange(comparator, convertToSi(value as number, selectedUnit));
            }}
            value={unit?.id}
            data-cy="unit-select"
          >
            {availableUnits.map((unit) => (
              <MenuItem key={unit.id} value={unit.id}>
                {unit.symbol}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default IntervalSearchCriteriaComponent;
