import LuxonUtils from '@date-io/luxon';
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
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { DateTime } from 'luxon';
import React, { useState } from 'react';

import { SearchCriteriaInputProps } from 'components/proposal/SearchCriteriaInputProps';
import { QuestionFilterCompareOperator } from 'generated/sdk';

function DateSearchCriteriaInput({
  onChange,
  searchCriteria,
}: SearchCriteriaInputProps) {
  const [value, setValue] = useState<MaterialUiPickersDate | null>(
    searchCriteria
      ? DateTime.fromJSDate(new Date(searchCriteria?.value as string))
      : null
  );
  const [comparator, setComparator] = useState<QuestionFilterCompareOperator>(
    searchCriteria?.compareOperator ?? QuestionFilterCompareOperator.EQUALS
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <FormControl style={{ width: '100%' }}>
          <InputLabel shrink id="comparator">
            Operator
          </InputLabel>
          <Select
            onChange={(event) => {
              const newComparator = event.target
                .value as QuestionFilterCompareOperator;
              setComparator(newComparator);
              if (value) {
                onChange(newComparator, value.toJSDate().toISOString());
              }
            }}
            value={comparator}
            labelId="comparator"
            data-cy="comparator"
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
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <KeyboardDatePicker
            disableToolbar
            format="yyyy-MM-dd"
            variant="inline"
            autoOk={true}
            label="Date"
            value={value}
            onChange={(date: MaterialUiPickersDate) => {
              let newDate: MaterialUiPickersDate = null;
              if (date && date.isValid) {
                newDate = date?.set({
                  hour: 0,
                  minute: 0,
                  second: 0,
                  millisecond: 0,
                }); // omit time
                onChange(comparator, newDate.toJSDate().toISOString());
              }
              setValue(newDate);
            }}
            InputLabelProps={{
              shrink: value ? true : undefined,
            }}
            data-cy="value"
          />
        </MuiPickersUtilsProvider>
      </Grid>
    </Grid>
  );
}

export default DateSearchCriteriaInput;
