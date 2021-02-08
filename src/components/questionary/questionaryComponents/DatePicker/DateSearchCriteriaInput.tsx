import DateFnsUtils from '@date-io/date-fns';
import { DateType } from '@date-io/type';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import React, { useState } from 'react';

import { SearchCriteriaInputProps } from 'components/common/proposalFilters/QuestionaryFilter';
import { QuestionFilterCompareOperator } from 'generated/sdk';

function DateSearchCriteriaInput({ onChange }: SearchCriteriaInputProps) {
  const [value, setValue] = useState<string | null>(null);
  const [comparator, setComparator] = useState<QuestionFilterCompareOperator>(
    QuestionFilterCompareOperator.EQUALS
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <FormControl style={{ width: '100%' }}>
          <InputLabel shrink id="comparator">
            Operator
          </InputLabel>
          <Select
            onChange={event => {
              const newComparator = event.target
                .value as QuestionFilterCompareOperator;
              setComparator(newComparator);
              if (value) {
                onChange(newComparator, value);
              }
            }}
            value={comparator}
            labelId="comparator"
          >
            <MenuItem key="eq" value={QuestionFilterCompareOperator.EQUALS}>
              Exact
            </MenuItem>
            <MenuItem key="lt" value={QuestionFilterCompareOperator.LESS_THAN}>
              Before
            </MenuItem>
            <MenuItem
              key="gt"
              value={QuestionFilterCompareOperator.GREATER_THAN}
            >
              After
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            disableToolbar
            format="yyyy-MM-dd"
            variant="inline"
            autoOk={true}
            label="Date"
            value={value}
            onChange={(date: DateType | null) => {
              if (date) {
                date.setUTCHours(0, 0, 0, 0);
                const newDate = date.toISOString();
                setValue(newDate);
                onChange(comparator, newDate);
              }
            }}
            InputLabelProps={{
              shrink: value ? true : undefined,
            }}
          />
        </MuiPickersUtilsProvider>
      </Grid>
    </Grid>
  );
}

export default DateSearchCriteriaInput;
