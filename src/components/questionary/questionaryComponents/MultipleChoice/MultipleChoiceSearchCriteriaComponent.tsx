import { FormControl, Grid, InputLabel, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React, { useState } from 'react';

import {
  QuestionFilterCompareOperator,
  SelectionFromOptionsConfig,
} from 'generated/sdk';

import { SearchCriteriaInputProps } from '../../../proposal/SearchCriteriaInputProps';

function MultipleChoiceSearchCriteriaComponent({
  onChange,
  questionTemplateRelation,
  searchCriteria,
}: SearchCriteriaInputProps) {
  const [value, setValue] = useState(searchCriteria?.value ?? '');

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl style={{ width: '100%' }}>
          {/* TODO here it should me made clear that in case of multiple question, the answer will be "one of" */}
          <InputLabel shrink id="answer">
            Answer
          </InputLabel>
          <Autocomplete
            id="answer"
            options={
              (questionTemplateRelation.config as SelectionFromOptionsConfig)
                .options
            }
            getOptionLabel={(option) => option as string}
            renderInput={(params) => <TextField {...params} label="Answer" />}
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
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default MultipleChoiceSearchCriteriaComponent;
