import FormControl from '@mui/material/FormControl';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';

const StyledPickerWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  '.rdp-range_start': {
    background: `linear-gradient(90deg, transparent 50%, ${theme.palette.primary.main} 50%)`,
    border: 'none',
  },
  '.rdp-range_end': {
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 50%, transparent 50%)`,
    border: 'none',
  },
  '.rdp-range_start .rdp-day_button, .rdp-range_end .rdp-day_button': {
    backgroundColor: theme.palette.primary.main,
    border: 'none',
  },
  '.rdp-range_middle .rdp-day_button': {
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    color: 'white',
  },
  '.rdp-day': {
    padding: 0,
    width: '100%',
    height: '100%',
  },
  '.rdp-nav svg': {
    fill: theme.palette.primary.dark,
  },
}));

//This is what appears to the user when filling in this question type
export function QuestionaryComponentDateRangePicker(
  props: BasicComponentProps
) {
  const { answer, onComplete } = props;
  const {
    question: { id },
  } = answer;

  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <FormControl margin="dense">
      <StyledPickerWrapper>
        <DayPicker
          ISOWeek
          id={`${id}-id`}
          mode="range"
          selected={range}
          onSelect={(value) => {
            setRange(value);
            if (value?.from && value?.to) {
              onComplete([range]);
            }
          }}
        />
      </StyledPickerWrapper>
    </FormControl>
  );
}
