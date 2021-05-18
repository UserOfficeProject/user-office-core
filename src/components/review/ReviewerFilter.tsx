import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import { StringParam, withDefault } from 'use-query-params';

import { ReviewerFilter } from 'generated/sdk';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export const defaultReviewerQueryFilter = withDefault(
  StringParam,
  ReviewerFilter.YOU
);

type ReviewerFilterComponentProps = {
  reviewer: string;
  onChange: (reviewer: ReviewerFilter) => void;
};

const ReviewerFilterComponent: React.FC<ReviewerFilterComponentProps> = ({
  reviewer,
  onChange,
}) => {
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <InputLabel shrink>Reviewer</InputLabel>
      <Select
        onChange={(e) => onChange(e.target.value as ReviewerFilter)}
        value={reviewer}
        data-cy="reviewer-filter"
      >
        <MenuItem value={ReviewerFilter.YOU}>You</MenuItem>
        <MenuItem value={ReviewerFilter.ALL}>All</MenuItem>
      </Select>
    </FormControl>
  );
};

export default ReviewerFilterComponent;
