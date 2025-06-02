import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import PropTypes from 'prop-types';
import React, { Dispatch } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Status } from 'generated/sdk';

type StatusFilterProps = {
  statuses?: Status[];
  isLoading?: boolean;
  onChange?: Dispatch<number>;
  shouldShowAll?: boolean;
  statusId?: number;
  hiddenStatuses: number[];
};

function checkToRemove(hiddenStatuses: number[], status: Status) {
  if (hiddenStatuses != null) {
    for (let i = 0; i < hiddenStatuses.length; i++) {
      if (hiddenStatuses[i] == status.id) return false;
    }
  }

  return true;
}

const StatusFilter = ({
  statuses,
  isLoading,
  statusId,
  onChange,
  shouldShowAll,
  hiddenStatuses,
}: StatusFilterProps) => {
  const [, setSearchParams] = useSearchParams();
  if (statuses === undefined) {
    return null;
  }

  /**
   * NOTE: We might use https://material-ui.com/components/autocomplete/.
   * If we have lot of dropdown options to be able to search.
   */
  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="status-select-label" shrink>
          Status
        </InputLabel>
        {isLoading ? (
          <Box sx={{ minHeight: '32px', marginTop: '16px' }}>Loading...</Box>
        ) : (
          <Select
            id="status-select"
            aria-labelledby="status-select-label"
            onChange={(status) => {
              setSearchParams((searchParams) => {
                searchParams.delete('status');
                if (status.target.value && !!shouldShowAll) {
                  searchParams.set('status', status.target.value.toString());
                }

                return searchParams;
              });
              onChange?.(status.target.value as number);
            }}
            value={statusId || 0}
            defaultValue={0}
            data-cy="status-filter"
          >
            {shouldShowAll && <MenuItem value={0}>All</MenuItem>}
            {statuses.map(
              (status) =>
                checkToRemove(hiddenStatuses, status) && (
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

StatusFilter.propTypes = {
  statuses: PropTypes.array,
  isLoading: PropTypes.bool,
  onChange: PropTypes.func,
  shouldShowAll: PropTypes.bool,
  statusId: PropTypes.number,
};

export default StatusFilter;
