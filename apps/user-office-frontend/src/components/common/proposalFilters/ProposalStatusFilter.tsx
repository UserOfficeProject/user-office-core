import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import React, { Dispatch } from 'react';
import { useQueryParams, NumberParam } from 'use-query-params';

import { ProposalStatus } from 'generated/sdk';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  loadingText: {
    minHeight: '32px',
    marginTop: '16px',
  },
}));

type ProposalStatusFilterProps = {
  proposalStatuses?: ProposalStatus[];
  isLoading?: boolean;
  onChange?: Dispatch<number>;
  shouldShowAll?: boolean;
  proposalStatusId?: number;
};

const ProposalStatusFilter: React.FC<ProposalStatusFilterProps> = ({
  proposalStatuses,
  isLoading,
  proposalStatusId,
  onChange,
  shouldShowAll,
}) => {
  const classes = useStyles();
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
      <FormControl className={classes.formControl}>
        <InputLabel id="proposal-status-select-label" shrink>
          Status
        </InputLabel>
        {isLoading ? (
          <div className={classes.loadingText}>Loading...</div>
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
            {proposalStatuses.map((proposalStatus) => (
              <MenuItem key={proposalStatus.id} value={proposalStatus.id}>
                {proposalStatus.name}
              </MenuItem>
            ))}
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
