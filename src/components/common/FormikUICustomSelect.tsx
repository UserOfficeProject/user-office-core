import { InputLabel, ListItemText, MenuItem, Select } from '@material-ui/core';
import { FormikActions } from 'formik';
import React from 'react';
type ValueType = string | number;
type ItemType = { label: string; value: ValueType };
type FormikUICustomSelectProps = {
  field: {
    name: string;
    onBlur: Function;
    onChange: Function;
    value: ValueType;
  };
  form: FormikActions<any>;
  availableOptions: ItemType[];
  id: string;
  label: string;
};
const FormikUICustomSelect = ({
  field,
  form,
  availableOptions,
  id,
  label,
  ...props
}: FormikUICustomSelectProps) => {
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    form.setFieldValue(field.name, event.target.value);
  };

  return (
    <>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <Select
        value={field.value}
        onChange={handleChange}
        MenuProps={MenuProps}
        id={id}
        {...props}
      >
        {availableOptions.map(curOption => (
          <MenuItem key={curOption.value} value={curOption.value}>
            <ListItemText primary={curOption.label} />
          </MenuItem>
        ))}
      </Select>
    </>
  );
};

export default FormikUICustomSelect;
