import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { DateRangeConfig } from 'generated/sdk';

import Hint from '../Hint';

const StyledPickerWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],

  '.rdp-month_caption': {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },

  '.rdp-weekday': {
    fontWeight: 600,
  },

  '.rdp-day': {
    padding: 0,
  },

  '.rdp-day_button': {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: 'none',
    transition: 'all 0.15s ease',
  },

  '.rdp-day_button:hover': {
    backgroundColor: theme.palette.action.hover,
  },

  // Range background
  '.rdp-range_middle': {
    backgroundColor: theme.palette.primary.light,
  },

  '.rdp-range_middle .rdp-day_button': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.contrastText,
    borderRadius: 0,
  },

  // Start of range
  '.rdp-range_start': {
    background: `linear-gradient(
      90deg,
      transparent 50%,
      ${theme.palette.primary.light} 50%
    )`,
  },

  '.rdp-range_start .rdp-day_button': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: '50%',
  },

  // End of range
  '.rdp-range_end': {
    background: `linear-gradient(
      90deg,
      ${theme.palette.primary.light} 50%,
      transparent 50%
    )`,
  },

  '.rdp-range_end .rdp-day_button': {
    backgroundColor: theme.palette.common.white,
    color: `${theme.palette.primary.main} !important`,
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: '50%',
  },

  '.rdp-nav_button': {
    borderRadius: '50%',
  },

  '.rdp-nav svg': {
    fill: theme.palette.primary.main,
  },
}));

export function QuestionaryComponentDateRangePicker(
  props: BasicComponentProps
) {
  const {
    answer,
    onComplete,
    formikProps: { errors },
  } = props;
  const {
    question: { id, question },
  } = answer;
  const { tooltip } = answer.config as DateRangeConfig;
  const [range, setRange] = useState<DateRange | undefined>();
  const isError = errors[id] ? true : false;
  useEffect(() => {
    if (answer?.value?.dateRanges?.[0]) {
      setRange(answer.value.dateRanges[0]);
    }
  }, []);

  return (
    <FormControl margin="dense" error={isError}>
      <StyledPickerWrapper>
        <FormLabel
          sx={{
            mb: 1,
            fontWeight: 500,
            color: 'text.primary',
          }}
        >
          {question}
        </FormLabel>
        <DayPicker
          ISOWeek
          required
          id={`${id}-id`}
          mode="range"
          selected={range}
          onSelect={(value: DateRange | undefined) => {
            setRange(value);
            if (value?.from && value?.to) {
              onComplete({ dateRanges: [value] });
            }
          }}
        />
      </StyledPickerWrapper>
      <Hint>{tooltip}</Hint>
      {isError && <FormHelperText>{errors[id]?.toString()}</FormHelperText>}
    </FormControl>
  );
}
