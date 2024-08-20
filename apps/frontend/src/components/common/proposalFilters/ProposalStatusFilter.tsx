import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import PropTypes from 'prop-types';
import React, { Dispatch } from 'react';
import { useQueryParams, NumberParam } from 'use-query-params';

import { ProposalStatus } from 'generated/sdk';

type ProposalStatusFilterProps = {
  proposalStatuses?: ProposalStatus[];
  isLoading?: boolean;
  onChange?: Dispatch<number>;
  shouldShowAll?: boolean;
  proposalStatusId?: number;
  hiddenStatuses: number[];
};

function checkToRemove(
  hiddenStatuses: number[],
  proposalStatus: ProposalStatus
) {
  if (hiddenStatuses != null) {
    for (let i = 0; i < hiddenStatuses.length; i++) {
      if (hiddenStatuses[i] == proposalStatus.id) return false;
    }
  }

  return true;
}

const ProposalStatusFilter = ({
  proposalStatuses,
  isLoading,
  proposalStatusId,
  onChange,
  shouldShowAll,
  hiddenStatuses,
}: ProposalStatusFilterProps) => {
  const [, setQuery] = useQueryParams({
    proposalStatus: NumberParam,
  });

  if (proposalStatuses === undefined) {
    return null;
  }

  /**
   * NOTE: We might use https://material-ui.com/components/autocomplete/.
   * If we have lot of dropdown options to be able to search.
   */
  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="proposal-status-select-label" shrink>
          Status
        </InputLabel>
        {isLoading ? (
          <Box sx={{ minHeight: '32px', marginTop: '16px' }}>Loading...</Box>
        ) : (
          <Select
            id="proposal-status-select"
            aria-labelledby="proposal-status-select-label"
            onChange={(proposalStatus) => {
              setQuery({
                proposalStatus: proposalStatus.target.value
                  ? (proposalStatus.target.value as number)
                  : undefined,
              });
              onChange?.(proposalStatus.target.value as number);
            }}
            value={proposalStatusId || 0}
            defaultValue={0}
            data-cy="status-filter"
          >
            {shouldShowAll && <MenuItem value={0}>All</MenuItem>}
            {proposalStatuses.map(
              (proposalStatus) =>
                checkToRemove(hiddenStatuses, proposalStatus) && (
                  <MenuItem key={proposalStatus.id} value={proposalStatus.id}>
                    {proposalStatus.name}
                  </MenuItem>
                )
            )}
          </Select>
        )}
      </FormControl>
    </>
  );
};

ProposalStatusFilter.propTypes = {
  proposalStatuses: PropTypes.array,
  isLoading: PropTypes.bool,
  onChange: PropTypes.func,
  shouldShowAll: PropTypes.bool,
  proposalStatusId: PropTypes.number,
};

export default ProposalStatusFilter;
