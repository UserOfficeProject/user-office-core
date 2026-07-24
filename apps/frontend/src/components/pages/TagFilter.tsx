import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useSearchParams } from 'react-router-dom';
import React, { Dispatch } from 'react';

type TagStatusFilterProps = {
  onChange: Dispatch<number>;
}

const TagFilter = ({
  onChange
}: TagStatusFilterProps) => {
  const [, setSearchParams] = useSearchParams();

    return (
      <FormControl>
        <InputLabel id="tag-select-label">Tag</InputLabel>
        <Select
          id="tag-select"
          labelId="tag-select-label"
          onChange={(e) => {
            setSearchParams((searchParams) => {
                searchParams.delete('tag');
                searchParams.set('tag', e.target.value.toString());
                return searchParams;
              });
            onChange?.(e.target.value as number)
          }}
          //value={0}
          defaultValue={0}
          data-cy="tag-filter"
        >
          <MenuItem key={"Base Role"} value={0}>Base Role</MenuItem>
          <MenuItem key={"ISIS"} value={1}>ISIS</MenuItem>
          <MenuItem key={"CLF"} value={2}>CLF</MenuItem>
        </Select>
      </FormControl>
    );
};

export default TagFilter;
