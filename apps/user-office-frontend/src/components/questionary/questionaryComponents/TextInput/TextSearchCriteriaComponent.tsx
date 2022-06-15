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
import { QuestionFilterCompareOperator } from 'generated/sdk';

function TextSearchCriteriaComponent({
  onChange,
  searchCriteria,
}: SearchCriteriaInputProps) {
  const [value, setValue] = useState(searchCriteria?.value ?? '');
  const [comparator, setComparator] = useState<QuestionFilterCompareOperator>(
    (searchCriteria?.compareOperator as QuestionFilterCompareOperator) ??
      QuestionFilterCompareOperator.EQUALS
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel shrink id="comparator">
            Operator
          </InputLabel>
          <Select
            onChange={(event) => {
              const newComparator = event.target
                .value as QuestionFilterCompareOperator;
              setComparator(newComparator);
              onChange(newComparator, value);
            }}
            value={comparator}
            labelId="comparator"
          >
            <MenuItem key="eq" value={QuestionFilterCompareOperator.EQUALS}>
              Equals
            </MenuItem>
            <MenuItem key="inc" value={QuestionFilterCompareOperator.INCLUDES}>
              Contains
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={8}>
        <TextField
          name="value"
          label="Value"
          value={value}
          margin="none"
          fullWidth
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => onChange(comparator, value)}
        />
      </Grid>
    </Grid>
  );
}

export default TextSearchCriteriaComponent;
