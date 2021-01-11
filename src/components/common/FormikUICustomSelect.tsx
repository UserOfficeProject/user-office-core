import Checkbox from '@material-ui/core/Checkbox';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { FieldInputProps, FormikHelpers } from 'formik';
import React from 'react';

export type ValueType = string | number;
type SelectedValueType = ValueType | ValueType[];

interface Option {
  label: string;
  value: ValueType;
}

// converts string|Option to Option
const normalizeOption = (option: Option | string): Option => {
  return typeof option === 'string' ? { label: option, value: option } : option;
};

const normalizeOptions = (options: Array<any>): Option[] => {
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
  const abvailableOptionsNormalized: Option[] = normalizeOptions(
    availableOptions
  );

  const getOptionByValue = (value: ValueType) =>
    abvailableOptionsNormalized.find(
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

  const getCheckboxForOption = (option: Option) => {
    if (multiple) {
      return (
        <Checkbox
          checked={(field.value as ValueType[]).includes(option.value)}
        />
      );
    } else {
      return null;
    }
  };

  return (
    <>
      <InputLabel htmlFor={id}>{label}</InputLabel>
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
        {abvailableOptionsNormalized.map(curOption => (
          <MenuItem key={curOption.value} value={curOption.value}>
            {getCheckboxForOption(curOption)}
            <ListItemText primary={curOption.label} />
          </MenuItem>
        ))}
      </Select>
    </>
  );
};

export default FormikUICustomSelect;
