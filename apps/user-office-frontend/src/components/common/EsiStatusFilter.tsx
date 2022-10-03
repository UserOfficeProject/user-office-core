import { FormControl } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

type EsiStatusFilterProps = {
  onChange?: (hasEvaluation: boolean | undefined) => void;
  value: boolean;
};

export function EsiStatusFilter(props: EsiStatusFilterProps) {
  const { onChange } = props;
  const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    loadingText: {
      minHeight: '32px',
      marginTop: '16px',
    },
  }));

  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <InputLabel shrink>Status</InputLabel>

      <Select
        id="esi-status"
        onChange={(event) => {
          const value = event.target.value as string;
          value === 'all'
            ? onChange?.(undefined)
            : onChange?.(value === 'evaluated');
        }}
        value={props.value === true ? 'evaluated' : 'notEvaluated'}
        defaultValue={'notEvaluated'}
        data-cy="esi-has-evaluation-filter"
      >
        <MenuItem value={'all'}>All</MenuItem>
        <MenuItem value={'notEvaluated'}>Not evaluated</MenuItem>
        <MenuItem value={'evaluated'}>Evaluated</MenuItem>
      </Select>
    </FormControl>
  );
}

export default EsiStatusFilter;
