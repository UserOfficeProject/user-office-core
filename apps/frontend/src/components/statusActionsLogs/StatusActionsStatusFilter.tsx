import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React from 'react';
import { StringParam, withDefault, QueryParamConfig } from 'use-query-params';

export enum StatusActionsLogStatus {
  ALL = 'all',
  SUCCESSFUL = 'true',
  FAILED = 'false',
}

export type StatusActionsLogQueryFilter = {
  statusActionsLogStatus: QueryParamConfig<string>;
};
export const defaultStatusActionsLogStatusQueryFilter = withDefault(
  StringParam,
  StatusActionsLogStatus.ALL
);

type StatusActionsStatusFilterProps = {
  statusActionsLogStatus: string;
  onChange: (statusActionsLogStatus: StatusActionsLogStatus) => void;
};

const StatusActionsLogStatusFilter = ({
  statusActionsLogStatus,
  onChange,
}: StatusActionsStatusFilterProps) => (
  <FormControl fullWidth>
    <InputLabel shrink>Status</InputLabel>
    <Select
      onChange={(e) => onChange(e.target.value as StatusActionsLogStatus)}
      value={statusActionsLogStatus}
      data-cy="status-actions-log-status-filter"
    >
      <MenuItem value={StatusActionsLogStatus.ALL}>All</MenuItem>
      <MenuItem value={StatusActionsLogStatus.SUCCESSFUL}>Successful</MenuItem>
      <MenuItem value={StatusActionsLogStatus.FAILED}>Failed</MenuItem>
    </Select>
  </FormControl>
);

export default StatusActionsLogStatusFilter;
