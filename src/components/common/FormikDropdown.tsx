import Clear from '@mui/icons-material/Clear';
import { FormControlTypeMap } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import MuiTextField from '@mui/material/TextField';
import { connect, Field, FormikContextType } from 'formik';
import { TextField } from 'formik-mui';
import React from 'react';

type TProps = {
  items: Option[];
  name: string;
  label: string;
  loading?: boolean;
  noOptionsText?: string;
  required?: boolean;
  disabled?: boolean;
  InputProps?: Record<string, unknown>;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isClearable?: boolean;
  margin?: FormControlTypeMap['props']['margin'];
};

const FormikDropdown: React.FC<
  TProps & {
    formik: FormikContextType<Record<string, unknown>>;
  }
> = ({
  name,
  label,
  required,
  disabled,
  children,
  loading = false,
  noOptionsText,
  items,
  value,
  InputProps,
  formik,
  onChange,
  isClearable,
}) => {
  const menuItems =
    items.length > 0 ? (
      items.map((option) => {
        return (
          <MenuItem key={option.value} value={option.value}>
            {option.text}
          </MenuItem>
        );
      })
    ) : (
      <MenuItem disabled key="no-options">
        {noOptionsText}
      </MenuItem>
    );

  /**
   * Looks like if the items for a select are updated
   * after the  select field was mounted
   * you will get warning about out of range values.
   * To fix that just avoid mounting the real select until it's loaded
   */
  if (loading) {
    return (
      <MuiTextField
        label={label}
        defaultValue="Loading..."
        disabled
        InputLabelProps={{
          shrink: true,
        }}
        fullWidth
        required={required}
      />
    );
  }

  const props: { value?: string } = {};
  // Formik v2 uses undefined as a real value instead of ignoring it
  // so if `value` wasn't provided don't even include it as a property
  // otherwise it will generate warnings
  if (value !== undefined) {
    props.value = value;
  }

  const handleClearSelection = () => {
    formik.setFieldValue(name, '');
  };

  if (isClearable && formik.values[name]) {
    InputProps = {
      ...InputProps,
      endAdornment: (
        <IconButton
          onClick={handleClearSelection}
          disabled={!formik.values[name]}
          style={{ marginRight: 20 }}
          title="Clear selection"
          data-cy="clear-selection"
        >
          <Clear color="disabled" fontSize="small" />
        </IconButton>
      ),
    };
  }

  return (
    <Field
      type="text"
      name={name}
      label={label}
      id={name + '-input'}
      select
      component={TextField}
      InputLabelProps={{
        shrink: true,
      }}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
        formik.handleChange(e);
      }}
      fullWidth
      required={required}
      disabled={disabled}
      InputProps={InputProps}
      {...props}
    >
      {children}
      {menuItems}
    </Field>
  );
};

export interface Option {
  text: string;
  value: string | number;
}

export default connect<TProps>(FormikDropdown);
