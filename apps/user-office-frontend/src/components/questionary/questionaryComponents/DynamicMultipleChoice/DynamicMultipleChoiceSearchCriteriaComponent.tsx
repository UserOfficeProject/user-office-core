import { Grid, TextField, Autocomplete } from '@mui/material';
import React, { useState } from 'react';

import {
  QuestionFilterCompareOperator,
  DynamicMultipleChoiceConfig,
} from 'generated/sdk';

import { SearchCriteriaInputProps } from '../../../proposal/SearchCriteriaInputProps';

function DynamicMultipleChoiceSearchCriteriaComponent({
  onChange,
  questionTemplateRelation,
  searchCriteria,
}: SearchCriteriaInputProps) {
  const [value, setValue] = useState(searchCriteria?.value ?? '');
  const content = (
    questionTemplateRelation.config as DynamicMultipleChoiceConfig
  ).options;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Autocomplete
          id="answer"
          options={content}
          getOptionLabel={(option) => option as string}
          renderInput={(params) => (
            <TextField {...params} margin="none" label="Answer" />
          )}
          onChange={(_event, newValue) => {
            setValue((newValue as string) ?? '');
            onChange(
              QuestionFilterCompareOperator.INCLUDES,
              newValue as string
            );
          }}
          value={value}
          data-cy="value"
        />
      </Grid>
    </Grid>
  );
}

export default DynamicMultipleChoiceSearchCriteriaComponent;
