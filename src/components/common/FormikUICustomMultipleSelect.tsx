import {
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  Input,
  InputLabel,
} from '@material-ui/core';
import { FormikActions } from 'formik';
import React from 'react';
const FormikUICustomMultipleSelect = ({
  field,
  form,
  availableOptions,
  id,
  label,
  ...props
}: {
  field: {
    name: string;
    onBlur: Function;
    onChange: Function;
    value: string[];
  };
  form: FormikActions<any>;
  availableOptions: string[];
  id: string;
  label: string;
}) => {
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
  const handleChange = (
    event: React.ChangeEvent<{
      value: unknown;
    }>
  ) => {
    form.setFieldValue(field.name, event.target.value); // value is string[]
  };

  return (
    <>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <Select
        multiple
        value={field.value}
        onChange={handleChange}
        input={<Input />}
        renderValue={selected => (selected as string[]).join(', ')}
        MenuProps={MenuProps}
        id={id}
        {...props}
      >
        {availableOptions.map(curOption => (
          <MenuItem key={curOption} value={curOption}>
            <Checkbox
              checked={field.value && field.value.indexOf(curOption) > -1}
            />
            <ListItemText primary={curOption} />
          </MenuItem>
        ))}
      </Select>
    </>
  );
};

export default FormikUICustomMultipleSelect;
