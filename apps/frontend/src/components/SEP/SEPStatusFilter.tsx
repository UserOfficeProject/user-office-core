import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React from 'react';
import { StringParam, withDefault, QueryParamConfig } from 'use-query-params';

export enum SEPStatus {
  ALL = 'all',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export type SEPStatusQueryFilter = { sepStatus: QueryParamConfig<string> };
export const defaultSEPStatusQueryFilter = withDefault(
  StringParam,
  SEPStatus.ACTIVE
);

type SEPStatusFilterProps = {
  sepStatus: string;
  onChange: (sepStatus: SEPStatus) => void;
};

const SEPStatusFilter = ({ sepStatus, onChange }: SEPStatusFilterProps) => (
  <FormControl fullWidth>
    <InputLabel shrink>Status</InputLabel>
    <Select
      onChange={(e) => onChange(e.target.value as SEPStatus)}
      value={sepStatus}
      data-cy="sep-status-filter"
    >
      <MenuItem value={SEPStatus.ALL}>All</MenuItem>
      <MenuItem value={SEPStatus.ACTIVE}>Active</MenuItem>
      <MenuItem value={SEPStatus.INACTIVE}>Inactive</MenuItem>
    </Select>
  </FormControl>
);

export default SEPStatusFilter;
