import { MenuItem } from '@material-ui/core';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import { FieldInputProps, FormikHelpers } from 'formik';
import React from 'react';

import MultiMenuItem from './MultiMenuItem';

export type ValueType = string | number;
type SelectedValueType = ValueType | ValueType[];

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
  return options.map(option => normalizeOption(option));
};

export interface FormikUICustomMultipleSelectProps {
  id: string;
  availableOptions: Option[] | string[];
  label: string;
  multiple?: boolean;
  // props below are injected by Field
  field: FieldInputProps<SelectedValueType>;
  form: FormikHelpers<any>;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
  getContentAnchorEl: null,
};

const FormikUICustomSelect = ({
  field,
  form,
  availableOptions,
  id,
  label,
  multiple,
  ...props
}: FormikUICustomMultipleSelectProps) => {
  const availableOptionsNormalized: Option[] = normalizeOptions(
    availableOptions
  );

  const getOptionByValue = (value: ValueType) =>
    availableOptionsNormalized.find(
      option => option.value === (value as ValueType)
    );

  const handleChange = (
    event: React.ChangeEvent<{
      value: SelectedValueType;
    }>
  ) => {
    const newValue = event.target.value;
    form.setFieldValue(field.name, newValue);
  };

  const SelectMenuItem = multiple ? MultiMenuItem : MenuItem;

  return (
    <>
      <InputLabel htmlFor={id} shrink>
        {label}
      </InputLabel>
      <Select
        value={field.value}
        multiple={multiple}
        // @ts-ignore-line seems to have wrong typedefinition for onChange signature
        onChange={handleChange}
        input={<Input />}
        renderValue={value => {
          if (multiple) {
            return (value as ValueType[])
              .map(item => getOptionByValue(item)?.label)
              .join(', ');
          } else {
            return getOptionByValue(value as ValueType)?.label;
          }
        }}
        MenuProps={MenuProps}
        id={id}
        {...props}
      >
        {availableOptionsNormalized.map(curOption => (
          <SelectMenuItem key={curOption.value} value={curOption.value}>
            <ListItemText primary={curOption.label} />
          </SelectMenuItem>
        ))}
      </Select>
    </>
  );
};

export default FormikUICustomSelect;
