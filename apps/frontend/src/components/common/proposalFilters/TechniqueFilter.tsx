import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, { Dispatch, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { TechniqueMinimalFragment, TechniqueFilterInput } from 'generated/sdk';
import { useTypeSafeSearchParams } from 'hooks/common/useTypeSafeSearchParams';

export enum TechniqueFilterEnum {
  ALL = 'all',
  MULTI = 'multi',
}

type TechniqueFilterProps = {
  techniques?: TechniqueMinimalFragment[];
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
  const initialParams = useMemo(
    () => ({
      technique: TechniqueFilterEnum.ALL,
    }),
    []
  );

  const [, setTypedParams] = useTypeSafeSearchParams<{
    technique: TechniqueFilterEnum;
  }>(initialParams);

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
              setTypedParams((prev) => ({
                ...prev,
                technique: e.target.value as TechniqueFilterEnum,
              }));
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
