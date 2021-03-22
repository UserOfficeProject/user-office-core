import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import makeStyles from '@material-ui/core/styles/makeStyles';
import PropTypes from 'prop-types';
import React, { Dispatch } from 'react';
import { useQueryParams, NumberParam } from 'use-query-params';

import { Instrument } from 'generated/sdk';

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

type InstrumentFilterProps = {
  instruments?: Instrument[];
  isLoading?: boolean;
  onChange?: Dispatch<number>;
  shouldShowAll?: boolean;
  instrumentId?: number;
};

const InstrumentFilter: React.FC<InstrumentFilterProps> = ({
  instruments,
  isLoading,
  instrumentId,
  onChange,
  shouldShowAll,
}) => {
  const classes = useStyles();
  const [, setQuery] = useQueryParams({
    instrument: NumberParam,
  });

  if (instruments === undefined) {
    return null;
  }

  /**
   * NOTE: We might use https://material-ui.com/components/autocomplete/.
   * If we have lot of dropdown options to be able to search.
   */
  return (
    <>
      <FormControl className={classes.formControl}>
        <InputLabel shrink>Instrument</InputLabel>
        {isLoading ? (
          <div className={classes.loadingText}>Loading...</div>
        ) : (
          <Select
            onChange={(instrument) => {
              setQuery({
                instrument: instrument.target.value
                  ? (instrument.target.value as number)
                  : undefined,
              });
              onChange?.(instrument.target.value as number);
            }}
            value={instrumentId || 0}
            defaultValue={0}
            data-cy="instrument-filter"
          >
            {shouldShowAll && <MenuItem value={0}>All</MenuItem>}
            {instruments.map((instrument) => (
              <MenuItem key={instrument.id} value={instrument.id}>
                {instrument.name}
              </MenuItem>
            ))}
          </Select>
        )}
      </FormControl>
    </>
  );
};

InstrumentFilter.propTypes = {
  instruments: PropTypes.array,
  isLoading: PropTypes.bool,
  onChange: PropTypes.func,
  shouldShowAll: PropTypes.bool,
  instrumentId: PropTypes.number,
};

export default InstrumentFilter;
