import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React from 'react';

import { ReviewStatus } from 'generated/sdk';

type ReviewStatusFilterProps = {
  reviewStatus: string;
  onChange: (reviewStatus: ReviewStatus) => void;
};

const ReviewStatusFilter = ({
  reviewStatus,
  onChange,
}: ReviewStatusFilterProps) => {
  return (
    <FormControl fullWidth>
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
