import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React, { Dispatch } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import {
  InstrumentFilterInput,
  InstrumentMinimalFragment,
} from 'generated/sdk';

export enum InstrumentFilterEnum {
  ALL = 'all',
  MULTI = 'multi',
}

export const parseInstrumentQuery = (
  instrumentQuery: string | null | undefined
): number[] | null => {
  if (
    instrumentQuery == null ||
    instrumentQuery === InstrumentFilterEnum.MULTI ||
    instrumentQuery === InstrumentFilterEnum.ALL
  ) {
    return null;
  }

  return instrumentQuery
    .split(',')
    .map(Number)
    .filter((id) => !isNaN(id));
};

export const getInstrumentFilterIds = (
  instrumentFilter: InstrumentFilterInput | null | undefined
): number[] | undefined => {
  if (instrumentFilter?.instrumentIds) {
    return instrumentFilter.instrumentIds;
  }

  return undefined;
};

type InstrumentFilterProps = {
  instruments?: InstrumentMinimalFragment[];
  isLoading?: boolean;
  onChange?: Dispatch<InstrumentFilterInput>;
  shouldShowAll?: boolean;
  shouldShowMultiple?: boolean;
  showMultiInstrumentProposals?: boolean;
  instrumentIds?: (number | null)[];
};

const InstrumentFilter = ({
  instruments,
  isLoading,
  instrumentIds,
  onChange,
  shouldShowAll,
  shouldShowMultiple,
  showMultiInstrumentProposals,
}: InstrumentFilterProps) => {
  const [, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  if (instruments === undefined) {
    return null;
  }

  /**
   * NOTE: We might use https://material-ui.com/components/autocomplete/.
   * If we have lot of dropdown options to be able to search.
   */
  // Determine the current selected values for the Select component.
  // Array of instruments unless 'ALL' or 'MULTI' is selected.
  let currentValue: string[];
  if (showMultiInstrumentProposals) {
    currentValue = [InstrumentFilterEnum.MULTI];
  } else if (instrumentIds && instrumentIds.length > 0) {
    const validIds = instrumentIds.filter((id): id is number => id != null);
    currentValue = validIds.map(String);
  } else {
    currentValue = [InstrumentFilterEnum.ALL];
  }

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const rawValue = event.target.value;
    const selected =
      typeof rawValue === 'string' ? rawValue.split(',') : rawValue;

    // Check if 'ALL' or 'MULTI' was selected
    const lastSelected = selected[selected.length - 1];
    if (
      lastSelected === InstrumentFilterEnum.ALL ||
      lastSelected === InstrumentFilterEnum.MULTI
    ) {
      // Clear instrument selections
      const newValue: InstrumentFilterInput = {
        instrumentIds: null,
        showMultiInstrumentProposals:
          lastSelected === InstrumentFilterEnum.MULTI,
        showAllProposals: lastSelected === InstrumentFilterEnum.ALL,
      };
      setSearchParams((searchParams) => {
        searchParams.delete('instrument');
        if (lastSelected === InstrumentFilterEnum.MULTI) {
          searchParams.set('instrument', InstrumentFilterEnum.MULTI);
        }

        return searchParams;
      });
      onChange?.(newValue);

      return;
    }

    const instrumentIdValues = selected
      .filter(
        (val) =>
          val !== InstrumentFilterEnum.ALL && val !== InstrumentFilterEnum.MULTI
      )
      .map(Number)
      .filter((id) => !isNaN(id));

    if (instrumentIdValues.length === 0) {
      const newValue: InstrumentFilterInput = {
        instrumentIds: null,
        showMultiInstrumentProposals: false,
        showAllProposals: true,
      };
      setSearchParams((searchParams) => {
        searchParams.delete('instrument');

        return searchParams;
      });
      onChange?.(newValue);

      return;
    }

    const newValue: InstrumentFilterInput = {
      instrumentIds: instrumentIdValues,
      showMultiInstrumentProposals: false,
      showAllProposals: false,
    };

    setSearchParams((searchParams) => {
      searchParams.set('instrument', instrumentIdValues.join(','));

      return searchParams;
    });
    onChange?.(newValue);
  };

  const renderValue = (selected: string[]) => {
    if (selected.includes(InstrumentFilterEnum.ALL) || selected.length === 0) {
      return 'All';
    }
    if (selected.includes(InstrumentFilterEnum.MULTI)) {
      return 'Multiple';
    }

    const selectedNames: string[] = [];
    for (const id of selected) {
      const matchingInstrument = instruments.find(
        (instrument) => instrument.id === Number(id)
      );
      if (matchingInstrument) {
        selectedNames.push(matchingInstrument.name);
      }
    }

    return selectedNames.join(', ');
  };

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="instrument-select-label" shrink>
          {t('instrument')}
        </InputLabel>
        {isLoading ? (
          <Box sx={{ minHeight: '32px', marginTop: '16px' }}>Loading...</Box>
        ) : (
          <Select
            id="instrument-select"
            aria-labelledby="instrument-select-label"
            multiple
            value={currentValue}
            onChange={handleChange}
            renderValue={renderValue}
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
              <MenuItem key={instrument.id} value={String(instrument.id)}>
                <Checkbox
                  checked={currentValue.includes(String(instrument.id))}
                />
                <ListItemText primary={instrument.name} />
              </MenuItem>
            ))}
          </Select>
        )}
      </FormControl>
    </>
  );
};

export default InstrumentFilter;
