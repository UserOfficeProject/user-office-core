import { Autocomplete, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useState } from 'react';

import {
  MultiPartSelectionConfig,
  QuestionFilterCompareOperator,
} from '../../../../generated/sdk';
import { SearchCriteriaInputProps } from '../../../proposal/SearchCriteriaInputProps';

export default function MultiPartSelectionSearchCriteriaComponent({
  onChange,
  questionTemplateRelation,
  searchCriteria,
}: SearchCriteriaInputProps) {
  const [value, setValue] = useState(searchCriteria?.value ?? '');
  const flattenPairs = (config: MultiPartSelectionConfig) => {
    let options: string[] = [];
    for (const pair of config.selectionPairs) {
      options.push(pair.key);
      options = options.concat(pair.value);
    }

    return options;
  };
  const options_: string[] = flattenPairs(
    questionTemplateRelation.config as MultiPartSelectionConfig
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Autocomplete
          id={'answer'}
          options={options_}
          getOptionLabel={(option) => option as string}
          renderInput={(params) => (
            <TextField {...params} margin={'none'} label={'Answer'} />
          )}
          onChange={(_event, newValue) => {
            setValue((newValue as string) ?? '');
            onChange(
              QuestionFilterCompareOperator.INCLUDES,
              newValue as string
            );
          }}
          value={value}
          data-cy={'value'}
        />
      </Grid>
    </Grid>
  );
}
