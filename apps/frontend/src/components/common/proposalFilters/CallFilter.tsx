import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import React, { Dispatch } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Call } from 'generated/sdk';

type CallFilterProps = {
  calls?: Pick<Call, 'shortCode' | 'id'>[];
  isLoading?: boolean;
  onChange?: Dispatch<number>;
  shouldShowAll?: boolean;
  shouldShowCurrent?: boolean;
  callId: number | null;
};

const CallFilter = ({
  calls,
  isLoading,
  callId,
  onChange,
  shouldShowAll,
  shouldShowCurrent,
}: CallFilterProps) => {
  const [, setSearchParams] = useSearchParams();

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
  const currentOption: CallOption = {
    id: -1,
    shortCode: 'Current',
  };

  const options: CallOption[] = [
    ...(shouldShowCurrent ? [currentOption] : []),
    ...(shouldShowAll ? [allOption] : []),
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
              setSearchParams((searchParams) => {
                searchParams.delete('call');
                searchParams.set('call', String(call.id));

                return searchParams;
              });
              onChange?.(call?.id as number);
            }}
            getOptionLabel={(option) => option.shortCode}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            options={options}
            value={
              options.find((v) => v.id === callId) ||
              (currentOption
                ? currentOption
                : shouldShowAll
                  ? allOption
                  : undefined)
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
