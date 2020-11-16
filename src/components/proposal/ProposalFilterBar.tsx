import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import makeStyles from '@material-ui/core/styles/makeStyles';
import PropTypes from 'prop-types';
import React from 'react';
import { useQueryParams, NumberParam } from 'use-query-params';

import SelectedCallFilter from 'components/common/SelectedCallFilter';
import SelectedProposalStatusFilter from 'components/common/SelectedProposalStatusFilter';
import {
  ProposalsFilter,
  Call,
  Instrument,
  ProposalStatus,
} from 'generated/sdk';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

type ProposalFilterBarProps = {
  calls: Call[];
  instruments: Instrument[];
  proposalStatuses: ProposalStatus[];
  setProposalFilter: (filter: ProposalsFilter) => void;
  filter: ProposalsFilter;
};

const ProposalFilterBar: React.FC<ProposalFilterBarProps> = ({
  calls,
  instruments,
  proposalStatuses,
  setProposalFilter,
  filter,
}) => {
  const classes = useStyles();
  const [, setQuery] = useQueryParams({
    instrument: NumberParam,
  });

  return (
    <>
      <SelectedCallFilter
        callId={filter.callId as number}
        calls={calls}
        shouldShowAll={true}
        onChange={callId => {
          setProposalFilter({
            ...filter,
            callId,
          });
        }}
      />

      <FormControl className={classes.formControl}>
        <InputLabel>Instrument</InputLabel>
        <Select
          onChange={instrument => {
            setQuery({
              instrument: instrument.target.value
                ? (instrument.target.value as number)
                : undefined,
            });
            setProposalFilter({
              ...filter,
              instrumentId: instrument.target.value as number,
            });
          }}
          value={filter.instrumentId}
          defaultValue={0}
        >
          <MenuItem value={0}>All</MenuItem>
          {instruments.map(instrument => (
            <MenuItem key={instrument.id} value={instrument.id}>
              {instrument.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <SelectedProposalStatusFilter
        proposalStatusId={filter.proposalStatusId as number}
        proposalStatuses={proposalStatuses}
        shouldShowAll={true}
        onChange={proposalStatusId => {
          setProposalFilter({
            ...filter,
            proposalStatusId,
          });
        }}
      />
    </>
  );
};

ProposalFilterBar.propTypes = {
  calls: PropTypes.array.isRequired,
  instruments: PropTypes.array.isRequired,
  proposalStatuses: PropTypes.array.isRequired,
  setProposalFilter: PropTypes.func.isRequired,
  filter: PropTypes.object.isRequired,
};

export default ProposalFilterBar;
