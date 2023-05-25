import { Grid, TextField, Autocomplete } from '@mui/material';
import React, { useState } from 'react';

import {
  Call,
  InstrumentWithAvailabilityTime,
  QuestionFilterCompareOperator,
} from 'generated/sdk';
import { useCallData } from 'hooks/call/useCallData';

import { SearchCriteriaInputProps } from '../../../proposal/SearchCriteriaInputProps';

function InstrumentPickerSearchCriteriaComponent({
  onChange,
  callId,
}: SearchCriteriaInputProps) {
  const [value, setValue] = useState<InstrumentWithAvailabilityTime | null>(
    null
  );

  const { call } = useCallData(callId);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Autocomplete
          id="answer"
          options={call?.instruments ?? []}
          getOptionLabel={(option) => option.name as string}
          renderInput={(params) => (
            <TextField {...params} margin="none" label="Answer" />
          )}
          onChange={(_event, newValue) => {
            setValue(newValue);
            if (!newValue) return;
            onChange(
              QuestionFilterCompareOperator.EQUALS,
              newValue.id as Call['id']
            );
          }}
          value={value}
          data-cy="value"
        />
      </Grid>
    </Grid>
  );
}

export default InstrumentPickerSearchCriteriaComponent;
