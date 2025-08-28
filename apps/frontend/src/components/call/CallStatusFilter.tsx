import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React from 'react';

export enum CallStatus {
  ALL = 'all',
  OPENUPCOMING = 'open',
  CLOSED = 'closed',
}

export type CallStatusFilters = 'all' | 'open' | 'closed';

type CallStatusFilterProps = {
  callStatus: string;
  show: boolean;
  onChange: (callStatus: CallStatus) => void;
};

const CallStatusFilter = ({
  callStatus,
  show,
  onChange,
}: CallStatusFilterProps) => {
  if (show) {
    return (
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
          <MenuItem value={CallStatus.OPENUPCOMING}>Open/Upcoming</MenuItem>
          <MenuItem value={CallStatus.CLOSED}>Closed</MenuItem>
        </Select>
      </FormControl>
    );
  } else {
    return <FormControl fullWidth></FormControl>;
  }
};

export default CallStatusFilter;
