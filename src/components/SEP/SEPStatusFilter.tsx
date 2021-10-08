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

const SEPStatusFilter: React.FC<SEPStatusFilterProps> = ({
  sepStatus,
  onChange,
}) => {
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
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
};

export default SEPStatusFilter;
