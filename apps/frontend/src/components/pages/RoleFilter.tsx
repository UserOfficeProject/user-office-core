import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useSearchParams } from 'react-router-dom';
import React, { Dispatch } from 'react';
import { useRolesData } from 'hooks/user/useRolesData';
import { Role } from 'generated/sdk';

type RoleStatusFilterProps = {
  roles?: Pick<Role, 'shortCode' | 'id'>[];
  isLoading?: boolean;
  onChange: Dispatch<number>;
  roleId: number | null;
}

const TagFilter = ({
  roles,
  isLoading,
  roleId,
  onChange,
}: RoleStatusFilterProps) => {
  const [, setSearchParams] = useSearchParams();
  const { rolesData, loading } = useRolesData();

  if (roles === undefined) {
    return null;
  }

  const sortedRoles = [...roles];
  sortedRoles.sort((a, b) => a.shortCode.localeCompare(b.shortCode));

  type RoleOption = {
    id: number;
    shortCode: string;
  };

    return (
      <FormControl>
        <InputLabel id="role-select-label">Tag</InputLabel>
        <Select
          id="role-select"
          labelId="role-select-label"
          onChange={(e) => {
            setSearchParams((searchParams) => {
                searchParams.delete('role');
                searchParams.set('role', e.target.value.toString());
                return searchParams;
              });
            onChange?.(e.target.value as number)
          }}
          defaultValue={0}
          data-cy="role-filter"
        >
          <MenuItem key={"Base User"} value={0}>Base Role</MenuItem>
          <MenuItem key={"ISIS User"} value={1}>ISIS</MenuItem>
          <MenuItem key={"CLF User"} value={2}>CLF</MenuItem>
        </Select>
      </FormControl>
    );
};

export default TagFilter;
