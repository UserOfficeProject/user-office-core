import { Grid, TextField, Autocomplete } from '@mui/material';
import React, { useState } from 'react';

import { QuestionFilterCompareOperator } from 'generated/sdk';
import { useGetDynamicMultipleChoiceOptions } from 'hooks/template/useGetDynamicMultipleChoiceOptions';

import { SearchCriteriaInputProps } from '../../../proposal/SearchCriteriaInputProps';

function DynamicMultipleChoiceSearchCriteriaComponent({
  onChange,
  questionTemplateRelation,
  searchCriteria,
}: SearchCriteriaInputProps) {
  const [value, setValue] = useState(searchCriteria?.value ?? '');
  const { options, loadingOptions } = useGetDynamicMultipleChoiceOptions(
    questionTemplateRelation.question.id
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Autocomplete
          id="answer"
          loading={loadingOptions}
          options={options}
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
