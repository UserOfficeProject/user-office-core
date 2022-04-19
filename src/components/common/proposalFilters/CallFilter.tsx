import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import React, { Dispatch } from 'react';
import { useQueryParams, NumberParam } from 'use-query-params';

import { Call } from 'generated/sdk';

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

type CallFilterProps = {
  calls?: Call[];
  isLoading?: boolean;
  onChange?: Dispatch<number>;
  shouldShowAll?: boolean;
  callId: number | null;
};

const CallFilter: React.FC<CallFilterProps> = ({
  calls,
  isLoading,
  callId,
  onChange,
  shouldShowAll,
}) => {
  const classes = useStyles();
  const [, setQuery] = useQueryParams({
    call: NumberParam,
  });

  if (calls === undefined) {
    return null;
  }

  /**
   * NOTE: We might use https://material-ui.com/components/autocomplete/.
   * If we have lot of dropdown options to be able to search.
   */
  return (
    <>
      <FormControl className={classes.formControl}>
        <InputLabel id="call-select-label" shrink>
          Call
        </InputLabel>
        {isLoading ? (
          <div className={classes.loadingText}>Loading...</div>
        ) : (
          <Select
            id="call-select"
            aria-labelledby="call-select-label"
            onChange={(call) => {
              setQuery({
                call: call.target.value
                  ? (call.target.value as number)
                  : undefined,
              });
              onChange?.(call.target.value as number);
            }}
            value={callId || 0}
            defaultValue={0}
            data-cy="call-filter"
          >
            {shouldShowAll && <MenuItem value={0}>All</MenuItem>}
            {calls.map((call) => (
              <MenuItem key={call.id} value={call.id}>
                {call.shortCode}
              </MenuItem>
            ))}
          </Select>
        )}
      </FormControl>
    </>
  );
};

CallFilter.propTypes = {
  calls: PropTypes.array,
  isLoading: PropTypes.bool,
  onChange: PropTypes.func,
  shouldShowAll: PropTypes.bool,
  callId: PropTypes.number,
};

export default CallFilter;
