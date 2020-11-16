import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import makeStyles from '@material-ui/core/styles/makeStyles';
import PropTypes from 'prop-types';
import React, { Dispatch } from 'react';
import { useQueryParams, NumberParam } from 'use-query-params';

import { ProposalStatus } from 'generated/sdk';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

type SelectedProposalStatusFilterProps = {
  proposalStatuses: ProposalStatus[];
  onChange?: Dispatch<number>;
  shouldShowAll?: boolean;
  proposalStatusId?: number;
};

const SelectedProposalStatusFilter: React.FC<SelectedProposalStatusFilterProps> = ({
  proposalStatuses,
  proposalStatusId,
  onChange,
  shouldShowAll,
}) => {
  const classes = useStyles();
  const [, setQuery] = useQueryParams({
    proposalStatus: NumberParam,
  });

  /**
   * NOTE: We might use https://material-ui.com/components/autocomplete/.
   * If we have lot of dropdown options to be able to search.
   */
  return (
    <>
      <FormControl className={classes.formControl}>
        <InputLabel>Status</InputLabel>
        <Select
          onChange={proposalStatus => {
            setQuery({
              proposalStatus: proposalStatus.target.value
                ? (proposalStatus.target.value as number)
                : undefined,
            });
            onChange?.(proposalStatus.target.value as number);
          }}
          value={proposalStatusId}
          defaultValue={0}
        >
          {shouldShowAll && <MenuItem value={0}>All</MenuItem>}
          {proposalStatuses.map(proposalStatus => (
            <MenuItem key={proposalStatus.id} value={proposalStatus.id}>
              {proposalStatus.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

SelectedProposalStatusFilter.propTypes = {
  proposalStatuses: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  shouldShowAll: PropTypes.bool,
  proposalStatusId: PropTypes.number,
};

export default SelectedProposalStatusFilter;
