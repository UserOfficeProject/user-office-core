import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import React, { Dispatch } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Tag } from 'generated/sdk';

type TagFilterProps = {
  tags?: Pick<Tag, 'shortCode' | 'id'>[];
  isLoading?: boolean;
  onChange?: Dispatch<number>;
  shouldShowAll?: boolean;
  tagId: number | null;
};

const TagFilter = ({
  tags,
  isLoading,
  tagId,
  onChange,
  shouldShowAll,
}: TagFilterProps) => {
  const [, setSearchParams] = useSearchParams();

  if (tags === undefined) {
    return null;
  }

  const sortedTags = [...tags];
  sortedTags.sort((a, b) => a.shortCode.localeCompare(b.shortCode));

  type TagOption = {
    id: number;
    shortCode: string;
  };

  const allOption: TagOption = {
    id: 0,
    shortCode: 'All',
  };
  const options: TagOption[] = [
    ...(shouldShowAll ? [allOption] : []), // Add all tag option if should show all.
    ...sortedTags,
  ];

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="tag-select-label" shrink>
          Tag
        </InputLabel>
        {isLoading ? (
          <Box sx={{ minHeight: '32px', marginTop: '16px' }}>Loading...</Box>
        ) : (
          <Autocomplete
            id="tag-select"
            aria-labelledby="tag-select-label"
            /*
             * The clear event is triggered when backspacing to empty, which
             * will reset the value to undefined, which will select "All".
             * Disabling it gives a better experience. If left empty, it will
             * reset to the last used value.
             */
            disableClearable
            onChange={(_, tag) => {
              setSearchParams((searchParams) => {
                searchParams.delete('tag');
                if (tag?.id) searchParams.set('tag', String(tag.id));

                return searchParams;
              });
              onChange?.(tag?.id as number);
            }}
            getOptionLabel={(option) => option.shortCode}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            options={options}
            value={
              options.find((v) => v.id === tagId) ||
              (shouldShowAll ? allOption : undefined)
            }
            data-cy="tag-filter"
            renderInput={(params) => <TextField {...params} />}
          />
        )}
      </FormControl>
    </>
  );
};

export default TagFilter;
