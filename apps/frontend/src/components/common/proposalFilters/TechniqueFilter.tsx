import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, { Dispatch } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { TechniqueFilterInput, TechniqueFragment } from 'generated/sdk';

export enum TechniqueFilterEnum {
  ALL = 'all',
  MULTI = 'multi',
}

type TechniqueFilterProps = {
  techniques?: TechniqueFragment[];
  isLoading?: boolean;
  onChange?: Dispatch<TechniqueFilterInput>;
  shouldShowAll?: boolean;
  shouldShowMultiple?: boolean;
  showMultiTechniqueProposals?: boolean;
  techniqueId?: number | null;
};

const TechniqueFilter = ({
  techniques,
  isLoading,
  techniqueId,
  onChange,
  shouldShowAll,
  shouldShowMultiple,
  showMultiTechniqueProposals,
}: TechniqueFilterProps) => {
  const [, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  if (techniques === undefined) {
    return null;
  }

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="technique-select-label" shrink>
          {t('Technique')}
        </InputLabel>
        {isLoading ? (
          <Box sx={{ minHeight: '32px', marginTop: '16px' }}>Loading...</Box>
        ) : (
          <Select
            id="technique-select"
            aria-labelledby="technique-select-label"
            onChange={(e) => {
              const newValue: TechniqueFilterInput = {
                techniqueId: null,
                showMultiTechniqueProposals: false,
                showAllProposals: false,
              };
              setSearchParams((searchParams) => {
                searchParams.delete('technique');

                if (
                  e.target.value &&
                  e.target.value != TechniqueFilterEnum.ALL
                ) {
                  searchParams.set('technique', e.target.value.toString());
                }

                return searchParams;
              });
              if (
                e.target.value === TechniqueFilterEnum.ALL ||
                e.target.value === TechniqueFilterEnum.MULTI
              ) {
                newValue.techniqueId = null;
                newValue.showMultiTechniqueProposals =
                  e.target.value === TechniqueFilterEnum.MULTI;
                newValue.showAllProposals =
                  e.target.value === TechniqueFilterEnum.ALL;
              } else {
                newValue.techniqueId = +e.target.value;
              }
              onChange?.(newValue);
            }}
            value={
              showMultiTechniqueProposals
                ? TechniqueFilterEnum.MULTI
                : techniqueId || TechniqueFilterEnum.ALL
            }
            data-cy="technique-filter"
          >
            <ListSubheader sx={{ lineHeight: 1 }}>
              <Divider>General</Divider>
            </ListSubheader>
            {shouldShowAll && (
              <MenuItem value={TechniqueFilterEnum.ALL}>All</MenuItem>
            )}
            {shouldShowMultiple && (
              <MenuItem value={TechniqueFilterEnum.MULTI}>Multiple</MenuItem>
            )}
            {techniques && (
              <ListSubheader sx={{ lineHeight: 1 }}>
                <Divider>Techniques</Divider>
              </ListSubheader>
            )}
            {techniques.map((technique) => (
              <MenuItem key={technique.id} value={technique.id}>
                {technique.name}
              </MenuItem>
            ))}
          </Select>
        )}
      </FormControl>
    </>
  );
};

export default TechniqueFilter;
