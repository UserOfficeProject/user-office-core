import { MenuItem } from '@mui/material';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { FieldInputProps, FormikHelpers, FormikValues } from 'formik';
import React from 'react';

import MultiMenuItem from './MultiMenuItem';

export type ValueType = string | number;
export type SelectedValueType = ValueType | ValueType[];

interface Option {
  label: string;
  value: ValueType;
}

/**
 * Converts string|Option to Option
 * @param option input
 */
const normalizeOption = (option: Option | string): Option => {
  return typeof option === 'string' ? { label: option, value: option } : option;
};

/**
 * Converts array of string|Option to array of Option
 * @param option input
 */
const normalizeOptions = (options: Array<Option | string>): Option[] => {
  return options.map((option) => normalizeOption(option));
};

export interface FormikUICustomMultipleSelectProps {
  id: string;
  availableOptions: Option[] | string[];
  label: string;
  multiple?: boolean;
  nbrOptionShown?: number;
  // props below are injected by Field
  field: FieldInputProps<SelectedValueType>;
  form: FormikHelpers<FormikValues>;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const FormikUICustomSelect = ({
  field,
  form,
  availableOptions,
  id,
  label,
  multiple,
  nbrOptionShown,
  ...props
}: FormikUICustomMultipleSelectProps) => {
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * (nbrOptionShown ?? 4.5) + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };
  const availableOptionsNormalized: Option[] =
    normalizeOptions(availableOptions);

  const getOptionByValue = (value: ValueType) =>
    availableOptionsNormalized.find(
      (option) => option.value === (value as ValueType)
    );

  const handleChange = (event: SelectChangeEvent<SelectedValueType>) => {
    const newValue = event.target.value;
    form.setFieldValue(field.name, newValue);
  };

  const SelectMenuItem = multiple ? MultiMenuItem : MenuItem;

  return (
    <>
      <InputLabel id={`${id}-label`} shrink>
        {label}
      </InputLabel>
      <Select
        value={field.value}
        multiple={multiple}
        onChange={handleChange}
        input={<Input />}
        renderValue={(value) => {
          if (multiple) {
            return (value as ValueType[])
              .map((item) => getOptionByValue(item)?.label)
              .join(', ');
          } else {
            return getOptionByValue(value as ValueType)?.label;
          }
        }}
        MenuProps={MenuProps}
        id={id}
        labelId={`${id}-label`}
        {...props}
      >
        {availableOptionsNormalized.map((curOption) => (
          <SelectMenuItem key={curOption.value} value={curOption.value}>
            <ListItemText primary={curOption.label} />
          </SelectMenuItem>
        ))}
      </Select>
    </>
  );
};

export default FormikUICustomSelect;
