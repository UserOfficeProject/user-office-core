import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import { StringParam, withDefault, QueryParamConfig } from 'use-query-params';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export enum CallStatus {
  ALL = 'all',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export type CallStatusQueryFilter = { callStatus: QueryParamConfig<string> };
export const defaultCallStatusQueryFilter = withDefault(
  StringParam,
  CallStatus.ACTIVE
);

type CallStatusFilterProps = {
  callStatus: string;
  onChange: (callStatus: CallStatus) => void;
};

const CallStatusFilter: React.FC<CallStatusFilterProps> = ({
  callStatus,
  onChange,
}) => {
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <InputLabel shrink>Status</InputLabel>
      <Select
        onChange={(e) => onChange(e.target.value as CallStatus)}
        value={callStatus}
        data-cy="call-status-filter"
      >
        <MenuItem value={CallStatus.ALL}>All</MenuItem>
        <MenuItem value={CallStatus.ACTIVE}>Active</MenuItem>
        <MenuItem value={CallStatus.INACTIVE}>Inactive</MenuItem>
      </Select>
    </FormControl>
  );
};

export default CallStatusFilter;
