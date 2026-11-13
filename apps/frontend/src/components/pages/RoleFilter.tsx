import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React, { Dispatch } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Role } from 'generated/sdk';
import { FALLBACK_ROLE_FOR_PAGE_CONTENT } from 'hooks/admin/useGetPageContent';

type RoleFilterProps = {
  roles?: Pick<Role, 'id' | 'title'>[];
  isLoading?: boolean;
  onChange: Dispatch<number[]>;
  roleIds?: number[];
  userIsBaseOfficer: boolean;
};

export const parseRoleQuery = (
  roleQuery: string | null | undefined
): number[] | null => {
  return roleQuery == null
    ? null
    : roleQuery
        .split(',')
        .map(Number)
        .filter((id) => !isNaN(id));
};

const RoleFilter = ({
  roles,
  isLoading,
  onChange,
  roleIds,
  userIsBaseOfficer,
}: RoleFilterProps) => {
  const [, setSearchParams] = useSearchParams();

  if (roles == null) {
    return null;
  }

  const sortedRoles = [...roles];
  sortedRoles.sort((a, b) => a.title.localeCompare(b.title));
  const currentValue = roleIds != null ? roleIds : [];

  const handleChange = (event: SelectChangeEvent<number[]>) => {
    const rawValue = event.target.value;
    const selectedRoles =
      typeof rawValue === 'string'
        ? rawValue
            .split(',')
            .map(Number)
            .filter((id) => !isNaN(id))
        : !Array.isArray(rawValue)
          ? [rawValue]
          : rawValue;

    const roleIdValues = selectedRoles.map(Number).filter((id) => !isNaN(id));

    setSearchParams((searchParams) => {
      searchParams.set('roles', selectedRoles.join(','));

      return searchParams;
    });
    onChange?.(roleIdValues);
  };

  const renderValue = (selected: number[]) => {
    const selectedRoles: string[] = [];
    if (
      userIsBaseOfficer &&
      selected.includes(FALLBACK_ROLE_FOR_PAGE_CONTENT)
    ) {
      selectedRoles.push('Default');
    }

    for (const id of selected) {
      const matchingRoles = roles.find((r) => r.id === id);
      if (matchingRoles) {
        selectedRoles.push(matchingRoles.title);
      }
    }

    return selectedRoles.join(', ');
  };

  return (
    <>
      <FormControl style={{ minWidth: 60 }}>
        <InputLabel id="role-select-label">Role</InputLabel>
        {isLoading ? (
          <Box sx={{ minHeight: '32px', marginTop: '16px' }}>Loading...</Box>
        ) : (
          <Select
            MenuProps={{
              anchorOrigin: {
                vertical: 'center',
                horizontal: 'left',
              },
            }}
            id="role-select"
            labelId="role-select-label"
            multiple
            onChange={handleChange}
            renderValue={renderValue}
            value={currentValue}
            data-cy="role-filter"
          >
            {!isLoading && userIsBaseOfficer && (
              <MenuItem key={'Default'} value={FALLBACK_ROLE_FOR_PAGE_CONTENT}>
                <Checkbox
                  checked={currentValue.includes(
                    FALLBACK_ROLE_FOR_PAGE_CONTENT
                  )}
                />
                <ListItemText primary={'Default'} />
              </MenuItem>
            )}
            {!isLoading &&
              sortedRoles.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  <Checkbox checked={currentValue.includes(r.id)} />
                  <ListItemText primary={r.title} />
                </MenuItem>
              ))}
          </Select>
        )}
      </FormControl>
    </>
  );
};

export default RoleFilter;
