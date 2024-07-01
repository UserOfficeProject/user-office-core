import { Grid, TextField, Autocomplete } from '@mui/material';
import React, { useState } from 'react';

import {
  Call,
  InstrumentOption,
  QuestionFilterCompareOperator,
  TechniquePickerConfig,
} from 'generated/sdk';

import { SearchCriteriaInputProps } from '../../../proposal/SearchCriteriaInputProps';

function TechniquePickerSearchCriteriaComponent({
  onChange,
  questionTemplateRelation,
}: SearchCriteriaInputProps) {
  const [value, setValue] = useState<InstrumentOption | null>(null);
  const techniques = (questionTemplateRelation.config as TechniquePickerConfig)
    .techniques;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Autocomplete
          id="answer"
          options={techniques}
          getOptionLabel={(option) => option.name as string}
          renderInput={(params) => (
            <TextField {...params} margin="none" label="Answer" />
          )}
          onChange={(_event, newValue) => {
            if (!newValue) return;
            setValue(newValue);
            onChange(
              QuestionFilterCompareOperator.EQUALS,
              newValue.id as Call['id']
            );
          }}
          value={value}
          data-cy="value"
        />
      </Grid>
    </Grid>
  );
}

export default TechniquePickerSearchCriteriaComponent;
