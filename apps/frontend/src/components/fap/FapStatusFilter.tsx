import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React from 'react';

export enum FapStatus {
  ALL = 'all',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

type FapStatusFilterProps = {
  fapStatus: string;
  onChange: (fapStatus: FapStatus) => void;
};

const FapStatusFilter = ({ fapStatus, onChange }: FapStatusFilterProps) => (
  <FormControl fullWidth>
    <InputLabel shrink>Status</InputLabel>
    <Select
      onChange={(e) => onChange(e.target.value as FapStatus)}
      value={fapStatus}
      data-cy="fap-status-filter"
    >
      <MenuItem value={FapStatus.ALL}>All</MenuItem>
      <MenuItem value={FapStatus.ACTIVE}>Active</MenuItem>
      <MenuItem value={FapStatus.INACTIVE}>Inactive</MenuItem>
    </Select>
  </FormControl>
);

export default FapStatusFilter;
