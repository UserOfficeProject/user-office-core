import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { StringParam, useQueryParams, withDefault } from 'use-query-params';

import { ReviewerFilter } from 'generated/sdk';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export const defaultReviewerQueryFilter = withDefault(
  StringParam,
  ReviewerFilter.ME
);

type ReviewerFilterComponentProps = {
  reviewer: string;
  onChange?: (reviewer: ReviewerFilter) => void;
};

const ReviewerFilterComponent: React.FC<ReviewerFilterComponentProps> = ({
  reviewer,
  onChange,
}) => {
  const classes = useStyles();
  const [, setQuery] = useQueryParams({
    reviewer: defaultReviewerQueryFilter,
  });

  return (
    <FormControl className={classes.formControl}>
      <InputLabel shrink>Reviewer</InputLabel>
      <Select
        id="reviewer-selection"
        onChange={(e) => {
          setQuery({
            reviewer: e.target.value ? e.target.value : undefined,
          });
          onChange?.(e.target.value as ReviewerFilter);
        }}
        value={reviewer}
        data-cy="reviewer-filter"
        // NOTE: We can't use data-cy here for options and this works as well to define a property on the menulist component
        MenuProps={{ MenuListProps: { property: 'reviewer-filter-options' } }}
      >
        <MenuItem value={ReviewerFilter.ME}>My proposals</MenuItem>
        <MenuItem value={ReviewerFilter.ALL}>All proposals</MenuItem>
      </Select>
    </FormControl>
  );
};

export default ReviewerFilterComponent;
