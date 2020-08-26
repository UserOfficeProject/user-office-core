import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import makeStyles from '@material-ui/core/styles/makeStyles';
import PropTypes from 'prop-types';
import React, { Dispatch } from 'react';

import { Call } from 'generated/sdk';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

type SelectedCallFilterProps = {
  callsData: Call[];
  onChange?: Dispatch<number>;
  shouldShowAll?: boolean;
  callId?: number;
};

const SelectedCallFilter: React.FC<SelectedCallFilterProps> = ({
  callsData,
  callId,
  onChange,
  shouldShowAll,
}) => {
  const classes = useStyles();

  /**
   * NOTE: We might use https://material-ui.com/components/autocomplete/.
   * If we have lot of dropdown options to be able to search.
   */
  return (
    <>
      <FormControl className={classes.formControl}>
        <InputLabel>Call</InputLabel>
        <Select
          onChange={call => onChange?.(call.target.value as number)}
          value={callId}
          defaultValue={0}
        >
          {shouldShowAll && <MenuItem value={0}>All</MenuItem>}
          {callsData.map(call => (
            <MenuItem key={call.id} value={call.id}>
              {call.shortCode}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

SelectedCallFilter.propTypes = {
  callsData: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  shouldShowAll: PropTypes.bool,
  callId: PropTypes.number,
};

export default SelectedCallFilter;
