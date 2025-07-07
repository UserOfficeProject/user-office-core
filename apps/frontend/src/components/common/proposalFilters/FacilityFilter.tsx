import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import React, { Dispatch } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Facility } from 'generated/sdk';

type FacilityFilterProps = {
  facilities?: Pick<Facility, 'shortCode' | 'id'>[];
  isLoading?: boolean;
  onChange?: Dispatch<number>;
  shouldShowAll?: boolean;
  facilityId: number | null;
};

const FacilityFilter = ({
  facilities,
  isLoading,
  facilityId,
  onChange,
  shouldShowAll,
}: FacilityFilterProps) => {
  const [, setSearchParams] = useSearchParams();

  if (facilities === undefined) {
    return null;
  }

  const sortedFacilities = [...facilities];
  sortedFacilities.sort((a, b) => a.shortCode.localeCompare(b.shortCode));

  type FacilityOption = {
    id: number;
    shortCode: string;
  };

  const allOption: FacilityOption = {
    id: 0,
    shortCode: 'All',
  };
  const options: FacilityOption[] = [
    ...(shouldShowAll ? [allOption] : []), // Add all facility option if should show all.
    ...sortedFacilities,
  ];

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="facility-select-label" shrink>
          Facility
        </InputLabel>
        {isLoading ? (
          <Box sx={{ minHeight: '32px', marginTop: '16px' }}>Loading...</Box>
        ) : (
          <Autocomplete
            id="facility-select"
            aria-labelledby="facility-select-label"
            /*
             * The clear event is triggered when backspacing to empty, which
             * will reset the value to undefined, which will select "All".
             * Disabling it gives a better experience. If left empty, it will
             * reset to the last used value.
             */
            disableClearable
            onChange={(_, facility) => {
              setSearchParams((searchParams) => {
                searchParams.delete('facility');
                if (facility?.id)
                  searchParams.set('facility', String(facility.id));

                return searchParams;
              });
              onChange?.(facility?.id as number);
            }}
            getOptionLabel={(option) => option.shortCode}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            options={options}
            value={
              options.find((v) => v.id === facilityId) ||
              (shouldShowAll ? allOption : undefined)
            }
            data-cy="facility-filter"
            renderInput={(params) => <TextField {...params} />}
          />
        )}
      </FormControl>
    </>
  );
};

export default FacilityFilter;
