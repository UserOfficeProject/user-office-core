import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { StringParam, withDefault, QueryParamConfig } from 'use-query-params';

import { ReviewStatus } from 'generated/sdk';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export type ReviewStatusQueryFilter = {
  reviewStatus: QueryParamConfig<string>;
};
export const defaultReviewStatusQueryFilter = withDefault(
  StringParam,
  ReviewStatus.DRAFT
);

type ReviewStatusFilterProps = {
  reviewStatus: string;
  onChange: (reviewStatus: ReviewStatus) => void;
};

const ReviewStatusFilter: React.FC<ReviewStatusFilterProps> = ({
  reviewStatus,
  onChange,
}) => {
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <InputLabel shrink>Review status</InputLabel>
      <Select
        onChange={(e) => onChange(e.target.value as ReviewStatus)}
        value={reviewStatus}
        data-cy="review-status-filter"
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value={ReviewStatus.DRAFT}>Draft</MenuItem>
        <MenuItem value={ReviewStatus.SUBMITTED}>Submitted</MenuItem>
      </Select>
    </FormControl>
  );
};

export default ReviewStatusFilter;
