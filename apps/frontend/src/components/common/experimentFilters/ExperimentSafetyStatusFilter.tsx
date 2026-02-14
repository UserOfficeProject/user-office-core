import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, { Dispatch } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Status } from 'generated/sdk';

type ExperimentSafetyStatusFilterProps = {
  statuses?: Status[];
  isLoading?: boolean;
  onChange?: Dispatch<number>;
  shouldShowAll?: boolean;
  statusId?: number;
  hiddenStatuses: string[];
};

function isStatusVisible(hiddenStatuses: string[], status: Status) {
  if (hiddenStatuses != null) {
    for (let i = 0; i < hiddenStatuses.length; i++) {
      if (hiddenStatuses[i] === status.id) return false;
    }
  }

  return true;
}

const ExperimentSafetyStatusFilter = ({
  statuses,
  isLoading,
  statusId,
  onChange,
  shouldShowAll,
  hiddenStatuses,
}: ExperimentSafetyStatusFilterProps) => {
  const [, setSearchParams] = useSearchParams();
  if (statuses === undefined) {
    return null;
  }

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="safety-status-select-label" shrink>
          Safety Status
        </InputLabel>
        {isLoading ? (
          <Box sx={{ minHeight: '32px', marginTop: '16px' }}>Loading...</Box>
        ) : (
          <Select
            id="safety-status-select"
            aria-labelledby="safety-status-select-label"
            onChange={(status) => {
              setSearchParams((searchParams) => {
                searchParams.delete('experimentSafetyStatus');
                if (status.target.value && !!shouldShowAll) {
                  searchParams.set(
                    'experimentSafetyStatus',
                    status.target.value.toString()
                  );
                }

                return searchParams;
              });
              onChange?.(status.target.value as number);
            }}
            value={statusId || 0}
            defaultValue={0}
            data-cy="safety-status-filter"
          >
            {shouldShowAll && <MenuItem value={0}>All</MenuItem>}
            {statuses.map(
              (status) =>
                isStatusVisible(hiddenStatuses, status) && (
                  <MenuItem key={status.id} value={status.id}>
                    {status.name}
                  </MenuItem>
                )
            )}
          </Select>
        )}
      </FormControl>
    </>
  );
};

export default ExperimentSafetyStatusFilter;
