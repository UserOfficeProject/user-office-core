import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { withStyles } from '@mui/styles';
import React from 'react';

const StyledToggleButtonGroup = withStyles((theme) => ({
  grouped: {
    margin: theme.spacing(0.5),
    border: 'none',
    '&:not(:first-child)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-child': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}))(ToggleButtonGroup);

export enum TimeSpan {
  TODAY = 'TODAY',
  NEXT_7_DAYS = 'NEXT_7_DAYS',
  NEXT_30_DAYS = 'NEXT_30_DAYS',
  NONE = 'NONE',
}
interface PresetDateSelectorProps {
  value: string | null;
  setValue: (value: TimeSpan) => void;
}
function PresetDateSelector({ value, setValue }: PresetDateSelectorProps) {
  return (
    <StyledToggleButtonGroup
      size="small"
      value={value}
      exclusive
      onChange={(_e, val) => setValue(val)}
    >
      <ToggleButton value={TimeSpan.TODAY}>Today</ToggleButton>
      <ToggleButton value={TimeSpan.NEXT_7_DAYS}>Next 7 days</ToggleButton>
      <ToggleButton value={TimeSpan.NEXT_30_DAYS}>Next 30 days</ToggleButton>
      <ToggleButton value={TimeSpan.NONE}>All</ToggleButton>
    </StyledToggleButtonGroup>
  );
}

export default PresetDateSelector;
