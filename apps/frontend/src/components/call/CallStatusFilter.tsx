import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React from 'react';
import { StringParam, withDefault, QueryParamConfig } from 'use-query-params';

export enum CallStatus {
  ALL = 'all',
  ACTIVE = 'active',
  ACTIVEINTERNAL = 'activeinternal',
  INACTIVE = 'inactive',
}

export type CallStatusFilters =
  | 'all'
  | 'active'
  | 'activeinternal'
  | 'inactive';
export type CallStatusQueryFilter = { callStatus: QueryParamConfig<string> };
export const defaultCallStatusQueryFilter = withDefault(
  StringParam,
  CallStatus.ACTIVE
);

type CallStatusFilterProps = {
  callStatus: string;
  onChange: (callStatus: CallStatus) => void;
};

const CallStatusFilter = ({ callStatus, onChange }: CallStatusFilterProps) => (
  <FormControl fullWidth>
    <InputLabel id="call-status-select-label">Status</InputLabel>
    <Select
      id="call-status-select"
      labelId="call-status-select-label"
      onChange={(e) => onChange(e.target.value as CallStatus)}
      value={callStatus}
      data-cy="call-status-filter"
    >
      <MenuItem value={CallStatus.ALL}>All</MenuItem>
      <MenuItem value={CallStatus.ACTIVE}>Active</MenuItem>
      <MenuItem value={CallStatus.ACTIVEINTERNAL}>Active Internal</MenuItem>
      <MenuItem value={CallStatus.INACTIVE}>Inactive</MenuItem>
    </Select>
  </FormControl>
);

export default CallStatusFilter;
