import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import { SearchCriteriaInputProps } from 'components/common/proposalFilters/QuestionaryFilter';
import { QuestionFilterCompareOperator } from 'generated/sdk';
import React, { useState } from 'react';

function TextSearchCriteriaComponent({ onChange }: SearchCriteriaInputProps) {
  const [value, setValue] = useState('');
  const [comparator, setComparator] = useState<QuestionFilterCompareOperator>(
    QuestionFilterCompareOperator.EQUALS
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <FormControl style={{ width: '100%' }}>
          <InputLabel shrink id="comparator">
            Compare operator
          </InputLabel>
          <Select
            onChange={event => {
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
      <Grid item xs={6}>
        <TextField
          name="value"
          label="Value"
          value={value}
          fullWidth
          onChange={e => setValue(e.target.value)}
          onBlur={() => onChange(comparator, value)}
        />
      </Grid>
    </Grid>
  );
}

export default TextSearchCriteriaComponent;
