import MenuItem from '@material-ui/core/MenuItem';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import PropTypes from 'prop-types';
import React, { PropsWithChildren } from 'react';

type TProps = {
  items: Option[];
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
};

const FormikDropdown: React.FC<PropsWithChildren<TProps>> = ({
  name,
  label,
  required,
  disabled,
  children,
  items,
}) => {
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
    >
      {children}
      {items.map(option => {
        return (
          <MenuItem key={option.value} value={option.value}>
            {option.text}
          </MenuItem>
        );
      })}
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
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default FormikDropdown;
