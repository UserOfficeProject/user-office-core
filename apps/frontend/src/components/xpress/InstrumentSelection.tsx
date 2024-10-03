import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, { Dispatch } from 'react';
import { useSearchParams } from 'react-router-dom';

import { InstrumentFilterInput, ProposalViewTechnique } from 'generated/sdk';
import { useTechniquesData } from 'hooks/technique/useTechniquesData';

import { useXpressInstrumentsData } from './useXpressInstrumentsData';

export enum InstrumentFilterEnum {
  ALL = 'all',
  MULTI = 'multi',
}

type InstrumentFilterProps = {
  techniqueInRow?: ProposalViewTechnique[] | null;
  onChange?: Dispatch<InstrumentFilterInput>;
  instrumentId?: number | null;
};

const InstrumentSelection = ({
  techniqueInRow,
  instrumentId,
  onChange,
}: InstrumentFilterProps) => {
  const [, setSearchParams] = useSearchParams();

  const { techniques } = useTechniquesData();
  const { instruments } = useXpressInstrumentsData();

  const techniquesIdsAttached = techniqueInRow
    ? techniqueInRow.map((technique) => technique.id)
    : [];

  const instrumentsAttachedTechnique = techniques
    ? techniques
        .filter(
          (technique) =>
            technique.instruments != null || technique.instruments != undefined
        )
        .filter((technique) => techniquesIdsAttached.includes(technique.id))
        .flatMap((technique) => technique.instruments)
        .map((instrument) => instrument.id)
    : [];

  const instrumentsList =
    instruments && instrumentsAttachedTechnique
      ? instruments.filter((instrument) =>
          instrumentsAttachedTechnique.includes(instrument.id)
        )
      : [];

  if (instrumentsList === undefined) {
    return null;
  }

  /**
   * NOTE: We might use https://material-ui.com/components/autocomplete/.
   * If we have lot of dropdown options to be able to search.
   */
  return (
    <>
      <FormControl fullWidth>
        <Select
          id="instrument-select"
          aria-labelledby="instrument-select-label"
          onChange={(e) => {
            const newValue: InstrumentFilterInput = {
              instrumentId: null,
              showMultiInstrumentProposals: false,
              showAllProposals: false,
            };

            setSearchParams((searchParams) => {
              searchParams.delete('instrument');
              if (
                e.target.value &&
                e.target.value != InstrumentFilterEnum.ALL
              ) {
                searchParams.set('instrument', e.target.value.toString());
              }

              return searchParams;
            });
            if (e.target.value) {
              newValue.instrumentId = +e.target.value;
            }
            onChange?.(newValue);
          }}
          value={instrumentId}
          data-cy="instrument-filter"
        >
          <ListSubheader sx={{ lineHeight: 1 }}>
            <Divider>General</Divider>
          </ListSubheader>
          <MenuItem value={InstrumentFilterEnum.ALL}>All</MenuItem>
          <MenuItem value={InstrumentFilterEnum.MULTI}>Multiple</MenuItem>
          <ListSubheader sx={{ lineHeight: 1 }}>
            <Divider>Instruments</Divider>
          </ListSubheader>
          {instrumentsList.map((instrument) => (
            <MenuItem key={instrument.id} value={instrument.id}>
              {instrument.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default InstrumentSelection;
