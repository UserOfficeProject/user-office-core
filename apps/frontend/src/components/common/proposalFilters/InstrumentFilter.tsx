import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import React, { Dispatch } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryParams, NumberParam } from 'use-query-params';

import { InstrumentFragment } from 'generated/sdk';

const useStyles = makeStyles(() => ({
  loadingText: {
    minHeight: '32px',
    marginTop: '16px',
  },
}));

type InstrumentFilterProps = {
  instruments?: InstrumentFragment[];
  isLoading?: boolean;
  onChange?: Dispatch<number>;
  shouldShowAll?: boolean;
  instrumentId?: number;
};

const InstrumentFilter = ({
  instruments,
  isLoading,
  instrumentId,
  onChange,
  shouldShowAll,
}: InstrumentFilterProps) => {
  const classes = useStyles();
  const [, setQuery] = useQueryParams({
    instrument: NumberParam,
  });
  const { t } = useTranslation();

  if (instruments === undefined) {
    return null;
  }

  /**
   * NOTE: We might use https://material-ui.com/components/autocomplete/.
   * If we have lot of dropdown options to be able to search.
   */
  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="instrument-select-label" shrink>
          {t('instrument')}
        </InputLabel>
        {isLoading ? (
          <div className={classes.loadingText}>Loading...</div>
        ) : (
          <Select
            id="instrument-select"
            aria-labelledby="instrument-select-label"
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
