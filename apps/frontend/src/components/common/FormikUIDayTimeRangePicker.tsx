import DateRangeIcon from '@mui/icons-material/DateRange';
import { Button } from '@mui/material';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { FieldProps, getIn } from 'formik';
import { Field } from 'formik';
import { DateTime } from 'luxon';
import React, { useState, useEffect, useRef } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import TextField from 'components/common/FormikUITextField';

const HourSelector = ({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}) => (
  <div>
    <label>{label}</label>
    <select value={value} onChange={onChange} disabled={disabled}>
      {Array.from({ length: 24 }, (_, i) =>
        [
          `${i.toString().padStart(2, '0')}:00`,
          `${i.toString().padStart(2, '0')}:30`,
        ].map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))
      )}
    </select>
  </div>
);

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

export interface DayRangePickerProps extends FieldProps {
  label?: string;
  helperText?: string;
  disabled?: boolean;
  id: string;
}

export function fieldToDayRangePicker({
  field: { value, name },
  form: { errors, touched, setFieldValue, setFieldTouched },
  helperText,
  disabled,
}: DayRangePickerProps) {
  const fieldError = getIn(errors, name);
  const showError = getIn(touched, name) && !!fieldError;

  const handleSelect = (range: DateRange | undefined) => {
    setFieldTouched(name, true, false);

    const fromDateTime = DateTime.fromJSDate(range?.from || new Date()).set({
      hour: parseInt(value?.from?.toFormat('HH') || '0'),
      minute: parseInt(value?.from?.toFormat('mm') || '0'),
    });
    const toDateTime = DateTime.fromJSDate(
      range?.to || range?.from || new Date()
    ).set({
      hour: parseInt(value?.to?.toFormat('HH') || '0'),
      minute: parseInt(value?.to?.toFormat('mm') || '0'),
    });

    setFieldValue(name, { from: fromDateTime, to: toDateTime }, false);
  };

  const splitValue = (value: {
    from: DateTime | undefined;
    to: DateTime | undefined;
  }) => ({
    fromDate: value?.from?.toJSDate() || undefined,
    toDate: value?.to?.toJSDate() || undefined,
    fromHour: value?.from?.toFormat('HH:mm') || '00:00',
    toHour: value?.to?.toFormat('HH:mm') || '00:00',
  });

  const { fromDate, toDate, fromHour, toHour } = splitValue(value);

  return {
    selected: { from: fromDate, to: toDate },
    fromHour,
    toHour,
    onSelect: handleSelect,
    disabled,
    ...(showError && { helperText: fieldError || helperText }),
  };
}

export default function DayTimeRangePicker({
  label,
  helperText,
  ...props
}: DayRangePickerProps) {
  const { selected, fromHour, toHour, onSelect, disabled } =
    fieldToDayRangePicker(props);
  const [showPicker, setShowPicker] = useState(false);
  const [startHour, setStartHour] = useState(fromHour);
  const [endHour, setEndHour] = useState(toHour);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateDateTimeString = (selected: DateRange) =>
    selected
      ? `${selected.from?.toLocaleDateString() || ''} ${startHour} - ${
          selected.to?.toLocaleDateString() || ''
        } ${endHour}`
      : '';

  const handleDone = () => {
    setShowPicker(false);
    props.form.setFieldValue(props.field.name, {
      from: DateTime.fromJSDate(selected.from).set({
        hour: parseInt(startHour.split(':')[0]),
        minute: parseInt(startHour.split(':')[1]),
      }),
      to: DateTime.fromJSDate(selected.to).set({
        hour: parseInt(endHour.split(':')[0]),
        minute: parseInt(endHour.split(':')[1]),
      }),
    });
  };

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
    >
      <div style={{ flex: 1 }}>
        {label && <label>{label}</label>}
        <Field
          data-cy={props.id}
          name="startEndDateField"
          component={TextField}
          multiline
          fullWidth
          placeholder="dd/mm/yyyy - dd/mm/yyyy"
          value={generateDateTimeString(selected)}
          onClick={() => setShowPicker((prev) => !prev)}
        />
      </div>
      <div
        onClick={() => setShowPicker((prev) => !prev)}
        style={{
          marginLeft: '8px',
          marginTop: '30px',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <DateRangeIcon />
      </div>
      {showPicker && (
        <Paper
          elevation={3}
          ref={pickerRef}
          style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1 }}
        >
          <StyledPickerWrapper>
            <DayPicker
              mode="range"
              selected={selected}
              onSelect={onSelect}
              disabled={disabled}
            />
          </StyledPickerWrapper>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px',
            }}
          >
            <HourSelector
              label="Start Hour:"
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              disabled={disabled}
            />
            <HourSelector
              label="End Hour:"
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
              disabled={disabled}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '8px',
            }}
          >
            <Button
              onClick={handleDone}
              variant="contained"
              color="primary"
              data-cy={`${props.id}-done-btn`}
            >
              Done
            </Button>
          </div>
        </Paper>
      )}
      {helperText && <p style={{ color: 'red' }}>{helperText}</p>}
    </div>
  );
}
