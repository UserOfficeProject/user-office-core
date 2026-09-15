import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, { Dispatch } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Role } from 'generated/sdk';
import { FALLBACK_ROLE_FOR_PAGE_CONTENT } from 'hooks/admin/useGetPageContent';

type RoleFilterProps = {
  roles?: Pick<Role, 'id' | 'title'>[];
  isLoading?: boolean;
  onChange: Dispatch<number>;
  roleId?: number;
  userIsBaseOfficer: boolean;
  currentRoleId: number;
};

const RoleFilter = ({
  roles,
  isLoading,
  onChange,
  roleId,
  userIsBaseOfficer,
  currentRoleId,
}: RoleFilterProps) => {
  const [, setSearchParams] = useSearchParams();

  if (roles == null) {
    return null;
  }

  const sortedRoles = [...roles];
  sortedRoles.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <FormControl>
      <InputLabel id="role-select-label">Role</InputLabel>
      {isLoading ? (
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
            roleId != null
              ? +roleId
              : userIsBaseOfficer
                ? FALLBACK_ROLE_FOR_PAGE_CONTENT
                : currentRoleId
          }
          data-cy="role-filter"
        >
          {!isLoading && userIsBaseOfficer && (
            <MenuItem key={'Default'} value={FALLBACK_ROLE_FOR_PAGE_CONTENT}>
              Default
            </MenuItem>
          )}
          {!isLoading &&
            roles.map((r) => (
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
