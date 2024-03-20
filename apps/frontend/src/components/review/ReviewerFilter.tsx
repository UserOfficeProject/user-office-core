import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, { useContext } from 'react';
import { StringParam, useQueryParams, withDefault } from 'use-query-params';

import { SettingsContext } from 'context/SettingsContextProvider';
import { ReviewerFilter, SettingsId } from 'generated/sdk';

type ReviewerFilterComponentProps = {
  reviewer: string;
  onChange?: (reviewer: ReviewerFilter) => void;
};

export const reviewFilter: Record<string, ReviewerFilter> = {
  ALL: ReviewerFilter.ALL,
  ME: ReviewerFilter.ME,
};

const ReviewerFilterComponent = ({
  reviewer,
  onChange,
}: ReviewerFilterComponentProps) => {
  const { settingsMap } = useContext(SettingsContext);
  const reviewFilterValue =
    settingsMap.get(SettingsId.DEFAULT_INST_SCI_REVIEWER_FILTER)
      ?.settingsValue || 'ME';
  let reviewerFilter = reviewFilter[reviewFilterValue];
  if (!reviewerFilter) {
    reviewerFilter = ReviewerFilter.ME;
  }
  const [, setQuery] = useQueryParams({
    reviewer: withDefault(StringParam, reviewerFilter),
  });

  return (
    <FormControl fullWidth>
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
