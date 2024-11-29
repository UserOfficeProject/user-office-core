import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, { useContext, useMemo } from 'react';

import { SettingsContext } from 'context/SettingsContextProvider';
import { ReviewerFilter, SettingsId } from 'generated/sdk';
import { useTypeSafeSearchParams } from 'hooks/common/useTypeSafeSearchParams';

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

  const initialParams = useMemo(
    () => ({
      reviewer: reviewerFilter,
    }),
    [reviewerFilter]
  );

  const [, setTypedParams] = useTypeSafeSearchParams<{
    reviewer: string;
  }>(initialParams);

  return (
    <FormControl fullWidth>
      <InputLabel shrink>Reviewer</InputLabel>
      <Select
        id="reviewer-selection"
        onChange={(e) => {
          setTypedParams((prev) => ({
            ...prev,
            reviewer: e.target.value as string,
          }));
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
