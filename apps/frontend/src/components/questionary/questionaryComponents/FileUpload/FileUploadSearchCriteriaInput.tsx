import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, { useState } from 'react';

import { SearchCriteriaInputProps } from 'components/proposal/SearchCriteriaInputProps';
import { QuestionFilterCompareOperator } from 'generated/sdk';

function FileUploadSearchCriteriaInput({
  onChange,
  searchCriteria,
}: SearchCriteriaInputProps) {
  const [value, setValue] = useState(searchCriteria?.value ?? '');

  return (
    <Grid container>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel shrink id="has-attachments">
            Has attachments
          </InputLabel>
          <Select
            value={value}
            onChange={(event) => {
              const newValue = event.target.value === 'yes';
              setValue(event.target.value as string);
              onChange(QuestionFilterCompareOperator.EXISTS, newValue);
            }}
            labelId="has-attachments"
            data-cy="has-attachments"
          >
            <MenuItem key="yes" value={'yes'}>
              Yes
            </MenuItem>
            <MenuItem key="no" value={'no'}>
              No
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default FileUploadSearchCriteriaInput;
