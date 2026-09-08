import DateRangeIcon from '@mui/icons-material/DateRange';
import { Box, Button, IconButton } from '@mui/material';
import Popover from '@mui/material/Popover';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { DayPicker, DateRange, Matcher } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

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

export interface DayRange {
  from?: DateTime;
  to?: DateTime;
}

export interface DayRangePickerProps {
  label?: string;
  value: DayRange;
  onChange: (range: DayRange) => void;
  /** Luxon format token used to display the selected dates. */
  format?: string | null;
  /** Earliest selectable date - days before it are disabled. */
  minDate?: DateTime;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  id?: string;
}

const formatDate = (date: DateTime | undefined, format?: string | null) => {
  if (!date) {
    return '';
  }

  return format
    ? date.toFormat(format)
    : date.toLocaleString(DateTime.DATE_SHORT);
};

export default function DayRangePicker({
  label,
  value,
  onChange,
  format,
  minDate,
  disabled,
  required,
  error,
  helperText,
  id,
}: DayRangePickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const selected: DateRange = {
    from: value?.from?.toJSDate(),
    to: value?.to?.toJSDate(),
  };

  const handleSelect = (range: DateRange | undefined) => {
    onChange({
      from: range?.from ? DateTime.fromJSDate(range.from) : undefined,
      to: range?.to ? DateTime.fromJSDate(range.to) : undefined,
    });
  };

  const displayValue = value?.from
    ? `${formatDate(value.from, format)} - ${formatDate(value.to, format)}`
    : '';

  const disabledDays: Matcher | undefined = minDate
    ? { before: minDate.toJSDate() }
    : undefined;

  return (
    <Box style={{ display: 'flex' }}>
      <Box style={{ flex: 1 }}>
        <TextField
          onClick={(event) => setAnchorEl(event.currentTarget)}
          data-cy={id}
          label={label}
          fullWidth
          required={required}
          disabled={disabled}
          placeholder="DD/MM/YYYY - DD/MM/YYYY"
          value={displayValue}
          error={!!error}
          helperText={error ?? helperText}
          InputLabelProps={{ shrink: true }}
          InputProps={{ readOnly: true }}
        />
      </Box>
      <IconButton
        onClick={(event) => setAnchorEl(event.currentTarget)}
        disabled={disabled}
        data-cy={id ? `${id}-calendar-btn` : undefined}
        aria-label="Open date range picker"
        sx={{ marginLeft: 1, marginTop: 1 }}
      >
        <DateRangeIcon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <StyledPickerWrapper>
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            disabled={disabledDays}
          />
        </StyledPickerWrapper>
        <Box
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '8px',
          }}
        >
          <Button
            onClick={() => setAnchorEl(null)}
            variant="contained"
            color="primary"
            data-cy={id ? `${id}-done-btn` : undefined}
          >
            Done
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}
