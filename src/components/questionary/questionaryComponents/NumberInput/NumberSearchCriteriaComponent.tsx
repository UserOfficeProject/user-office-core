import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import React, { useState } from 'react';

import { SearchCriteriaInputProps } from 'components/proposal/SearchCriteriaInputProps';
import {
  NumberInputConfig,
  QuestionFilterCompareOperator,
} from 'generated/sdk';

function NumberSearchCriteriaComponent({
  onChange,
  searchCriteria,
  questionTemplateRelation,
}: SearchCriteriaInputProps) {
  const [value, setValue] = useState(searchCriteria?.value ?? '');
  const [comparator, setComparator] = useState<QuestionFilterCompareOperator>(
    (searchCriteria?.compareOperator as QuestionFilterCompareOperator) ??
      QuestionFilterCompareOperator.EQUALS
  );

  const config = questionTemplateRelation.config as NumberInputConfig;

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <FormControl style={{ width: '100%' }}>
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
            <MenuItem key="lt" value={QuestionFilterCompareOperator.LESS_THAN}>
              Less than (&lt;)
            </MenuItem>
            <MenuItem key="eq" value={QuestionFilterCompareOperator.EQUALS}>
              Equals (=)
            </MenuItem>
            <MenuItem
              key="gt"
              value={QuestionFilterCompareOperator.GREATER_THAN}
            >
              Greater than (&gt;)
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <TextField
          name="value"
          label="Value"
          type="number"
          value={value}
          fullWidth
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => onChange(comparator, value)}
        />
      </Grid>
      <Grid item xs={4} style={{ marginTop: 'auto' }}>
        {config.units?.join(',')}
      </Grid>
    </Grid>
  );
}

export default NumberSearchCriteriaComponent;
