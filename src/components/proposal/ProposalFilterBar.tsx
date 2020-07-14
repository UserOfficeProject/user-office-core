import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import React, { Dispatch, SetStateAction } from 'react';

import SelectedCallFilter from 'components/common/SelectedCallFilter';
import { ProposalsFilter, Call, Instrument } from 'generated/sdk';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));
export default function ProposalFilterBar(props: {
  callsData: Call[];
  instrumentsData: Instrument[];
  onChange: Dispatch<SetStateAction<ProposalsFilter>>;
  filter: ProposalsFilter;
}) {
  const classes = useStyles();

  return (
    <>
      <SelectedCallFilter
        callId={props.filter.callId as number}
        callsData={props.callsData}
        shouldShowAll={true}
        onChange={callId =>
          props.onChange({
            ...props.filter,
            callId,
          })
        }
      />
      <FormControl className={classes.formControl}>
        <InputLabel>Instrument</InputLabel>
        <Select
          onChange={instrument =>
            props.onChange({
              ...props.filter,
              instrumentId: instrument.target.value as number,
            })
          }
          value={props.filter.instrumentId}
          defaultValue={0}
        >
          <MenuItem value={0}>All</MenuItem>
          {props.instrumentsData.map(instrument => (
            <MenuItem
              key={instrument.instrumentId}
              value={instrument.instrumentId}
            >
              {instrument.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}
