import DateAdapter from '@mui/lab/AdapterLuxon';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from '@mui/material';
import { DateTime } from 'luxon';
import React, { useState, useEffect } from 'react';

import { SearchCriteriaInputProps } from 'components/proposal/SearchCriteriaInputProps';
import { QuestionFilterCompareOperator, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

function DateSearchCriteriaInput({
  onChange,
  searchCriteria,
}: SearchCriteriaInputProps) {
  const theme = useTheme();
  const { format, mask } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });
  const [value, setValue] = useState<DateTime | null>(
    searchCriteria
      ? DateTime.fromISO((searchCriteria.value as string) || '')
      : null
  );
  const [comparator, setComparator] = useState<QuestionFilterCompareOperator>(
    searchCriteria?.compareOperator ?? QuestionFilterCompareOperator.EQUALS
  );

  useEffect(() => {
    if (!searchCriteria?.value) {
      setValue(null);
    }
  }, [searchCriteria?.value]);

  return (
    <Grid container spacing={2} alignItems="end">
      <Grid item xs={6}>
        <FormControl fullWidth>
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
        <LocalizationProvider dateAdapter={DateAdapter}>
          <DatePicker
            inputFormat={format || undefined}
            mask={mask}
            renderInput={(props) => (
              <TextField
                {...props}
                size="small"
                fullWidth
                data-cy="value"
                InputLabelProps={{
                  shrink: value ? true : undefined,
                }}
              />
            )}
            label={`Date(${format})`}
            value={value}
            onChange={(date: DateTime | null) => {
              const newDate = date?.startOf('day');

              if (newDate && newDate.isValid) {
                onChange(comparator, newDate.toJSDate().toISOString());
              }
              setValue(newDate || null);
            }}
            desktopModeMediaQuery={theme.breakpoints.up('sm')}
          />
        </LocalizationProvider>
      </Grid>
    </Grid>
  );
}

export default DateSearchCriteriaInput;
