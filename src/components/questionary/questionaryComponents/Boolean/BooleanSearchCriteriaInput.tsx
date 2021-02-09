import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import React, { useState } from 'react';

import { SearchCriteriaInputProps } from 'components/common/proposalFilters/QuestionaryFilter';
import { QuestionFilterCompareOperator } from 'generated/sdk';

function BooleanSearchCriteriaInput({
  onChange,
  searchCriteria,
}: SearchCriteriaInputProps) {
  const [value, setValue] = useState(searchCriteria?.value ?? false);

  return (
    <Grid container>
      <Grid item xs={12}>
        <FormControl style={{ width: '100%' }}>
          <InputLabel shrink id="is-checked">
            Value
          </InputLabel>
          <Select
            value={value}
            onChange={event => {
              const newValue = event.target.value === 'yes';
              setValue(newValue);
              onChange(QuestionFilterCompareOperator.EQUALS, newValue);
            }}
            labelId="is-checked"
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

export default BooleanSearchCriteriaInput;
