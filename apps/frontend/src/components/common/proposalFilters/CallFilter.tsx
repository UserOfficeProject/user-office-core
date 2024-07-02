import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import React, { Dispatch } from 'react';
import { useQueryParams, NumberParam } from 'use-query-params';

import { Call } from 'generated/sdk';

type CallFilterProps = {
  calls?: Call[];
  isLoading?: boolean;
  onChange?: Dispatch<number>;
  shouldShowAll?: boolean;
  callId: number | null;
};

const CallFilter = ({
  calls,
  isLoading,
  callId,
  onChange,
  shouldShowAll,
}: CallFilterProps) => {
  const [, setQuery] = useQueryParams({
    call: NumberParam,
  });

  if (calls === undefined) {
    return null;
  }

  const sortedCalls = [...calls];
  sortedCalls.sort((a, b) => a.shortCode.localeCompare(b.shortCode));

  type CallOption = {
    id: number;
    shortCode: string;
  };

  const allOption: CallOption = {
    id: 0,
    shortCode: 'All',
  };
  const options: CallOption[] = [
    ...(shouldShowAll ? [allOption] : []), // Add all call option if should show all.
    ...sortedCalls,
  ];

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="call-select-label" shrink>
          Call
        </InputLabel>
        {isLoading ? (
          <Box sx={{ minHeight: '32px', marginTop: '16px' }}>Loading...</Box>
        ) : (
          <Autocomplete
            id="call-select"
            aria-labelledby="call-select-label"
            /*
             * The clear event is triggered when backspacing to empty, which
             * will reset the value to undefined, which will select "All".
             * Disabling it gives a better experience. If left empty, it will
             * reset to the last used value.
             */
            disableClearable
            onChange={(_, call) => {
              setQuery({
                call: call?.id ? (call?.id as number) : undefined,
              });
              onChange?.(call?.id as number);
            }}
            getOptionLabel={(option) => option.shortCode}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            options={options}
            value={
              options.find((v) => v.id === callId) ||
              (shouldShowAll ? allOption : undefined)
            }
            data-cy="call-filter"
            renderInput={(params) => <TextField {...params} />}
          />
        )}
      </FormControl>
    </>
  );
};

export default CallFilter;
