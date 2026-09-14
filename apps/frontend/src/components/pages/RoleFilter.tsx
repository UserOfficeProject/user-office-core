import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, { Dispatch } from 'react';
import { useSearchParams } from 'react-router-dom';

import { FALLBACK_ROLE_FOR_PAGE_CONTENT } from 'hooks/admin/useGetPageContent';

import { RoleFilterArgs } from './PageEditor';

type RoleStatusFilterProps = {
  roleFilter: RoleFilterArgs;
  onChange: Dispatch<number>;
};

const RoleFilter = ({ roleFilter, onChange }: RoleStatusFilterProps) => {
  const { roleId, rolesData, loading } = roleFilter;
  const [, setSearchParams] = useSearchParams();

  if (rolesData == null || rolesData.roles == null) {
    return null;
  }

  const sortedRoles = [...rolesData.roles];
  sortedRoles.sort((a, b) => a.shortCode.localeCompare(b.shortCode));

  return (
    <FormControl>
      <InputLabel id="role-select-label">Role</InputLabel>
      {loading ? (
        <Box sx={{ minHeight: '32px', marginTop: '16px' }}>Loading...</Box>
      ) : (
        <Select
          id="role-select"
          labelId="role-select-label"
          onChange={(e) => {
            setSearchParams((searchParams) => {
              searchParams.delete('role');
              searchParams.set('role', e.target.value.toString());

              return searchParams;
            });
            onChange?.(e.target.value as number);
          }}
          defaultValue={
            roleId
              ? +roleId
              : rolesData.roles.filter((r) => !r.tags?.length).length
                ? FALLBACK_ROLE_FOR_PAGE_CONTENT
                : rolesData.roles[0].id
          }
          data-cy="role-filter"
        >
          {!loading &&
            rolesData.roles.filter((r) => !r.tags?.length).length && (
              <MenuItem key={'Default'} value={FALLBACK_ROLE_FOR_PAGE_CONTENT}>
                Default
              </MenuItem>
            )}
          {!loading &&
            rolesData.roles.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.title}
              </MenuItem>
            ))}
        </Select>
      )}
    </FormControl>
  );
};

export default RoleFilter;
