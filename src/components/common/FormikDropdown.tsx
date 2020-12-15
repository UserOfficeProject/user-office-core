import MenuItem from '@material-ui/core/MenuItem';
import MuiTextField from '@material-ui/core/TextField';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import PropTypes from 'prop-types';
import React, { PropsWithChildren } from 'react';

type TProps = {
  items: Option[];
  name: string;
  label: string;
  loading?: boolean;
  noOptionsText?: string;
  required?: boolean;
  disabled?: boolean;
  InputProps?: object;
  value?: string;
};

const FormikDropdown: React.FC<PropsWithChildren<TProps>> = ({
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
}) => {
  const menuItems =
    items.length > 0 ? (
      items.map(option => {
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
        margin="normal"
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

  return (
    <Field
      type="text"
      name={name}
      label={label}
      select
      margin="normal"
      component={TextField}
      InputLabelProps={{
        shrink: true,
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

FormikDropdown.propTypes = {
  items: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  noOptionsText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  value: PropTypes.string,
  InputProps: PropTypes.object,
};

export default FormikDropdown;
