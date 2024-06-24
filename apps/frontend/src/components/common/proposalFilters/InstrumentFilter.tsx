import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import React, { Dispatch } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryParams, StringParam } from 'use-query-params';

import { InstrumentFilterInput, InstrumentFragment } from 'generated/sdk';

const useStyles = makeStyles(() => ({
  loadingText: {
    minHeight: '32px',
    marginTop: '16px',
  },
}));

export enum InstrumentFilterEnum {
  ALL = 'all',
  MULTI = 'multi',
}

type InstrumentFilterProps = {
  instruments?: InstrumentFragment[];
  isLoading?: boolean;
  onChange?: Dispatch<InstrumentFilterInput>;
  shouldShowAll?: boolean;
  shouldShowMultiple?: boolean;
  showMultiInstrumentProposals?: boolean;
  instrumentId?: number | null;
};

const InstrumentFilter = ({
  instruments,
  isLoading,
  instrumentId,
  onChange,
  shouldShowAll,
  shouldShowMultiple,
  showMultiInstrumentProposals,
}: InstrumentFilterProps) => {
  const classes = useStyles();
  const [, setQuery] = useQueryParams({
    instrument: StringParam,
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
            onChange={(e) => {
              const newValue: InstrumentFilterInput = {
                instrumentId: null,
                showMultiInstrumentProposals: false,
                showAllProposals: false,
              };
              setQuery({
                instrument: e.target.value
                  ? e.target.value.toString()
                  : undefined,
              });
              if (
                e.target.value === InstrumentFilterEnum.ALL ||
                e.target.value === InstrumentFilterEnum.MULTI
              ) {
                newValue.instrumentId = null;
                newValue.showMultiInstrumentProposals =
                  e.target.value === InstrumentFilterEnum.MULTI;
                newValue.showAllProposals =
                  e.target.value === InstrumentFilterEnum.ALL;
              } else {
                newValue.instrumentId = +e.target.value;
              }
              onChange?.(newValue);
            }}
            value={
              showMultiInstrumentProposals
                ? InstrumentFilterEnum.MULTI
                : instrumentId || InstrumentFilterEnum.ALL
            }
            data-cy="instrument-filter"
          >
            <ListSubheader sx={{ lineHeight: 1 }}>
              <Divider>General</Divider>
            </ListSubheader>
            {shouldShowAll && (
              <MenuItem value={InstrumentFilterEnum.ALL}>All</MenuItem>
            )}
            {shouldShowMultiple && (
              <MenuItem value={InstrumentFilterEnum.MULTI}>Multiple</MenuItem>
            )}
            <ListSubheader sx={{ lineHeight: 1 }}>
              <Divider>Instruments</Divider>
            </ListSubheader>
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

export default InstrumentFilter;
