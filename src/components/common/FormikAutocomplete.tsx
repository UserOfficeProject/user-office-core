import { PropTypes, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { connect, FormikContextType } from 'formik';
import React from 'react';

import ErrorMessage from './ErrorMessage';

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
  margin?: PropTypes.Margin;
};

const FormikAutocomplete: React.FC<
  TProps & {
    formik: FormikContextType<Record<string, unknown>>;
  }
> = ({
  name,
  label,
  required,
  disabled,
  loading = false,
  noOptionsText,
  items,
  InputProps,
  formik,
  onChange,
  isClearable,
}) => {
  return (
    <>
      <Autocomplete
        options={items}
        disableClearable={!isClearable}
        disabled={disabled}
        loading={loading}
        noOptionsText={noOptionsText}
        id={name + '-input'}
        getOptionLabel={(option) => option.text}
        includeInputInList
        onChange={(e, value) => {
          formik.setFieldValue(name, value !== null ? value.value : '');
          onChange && onChange(e as React.ChangeEvent<HTMLInputElement>);
        }}
        defaultValue={{
          text:
            items.find((item) => item.value == formik.values[name])?.text ?? '',
          value: formik.values[name] as Option['value'],
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            {...InputProps}
            error={Boolean(formik.touched.contact && formik.errors[name])}
            margin="normal"
            label={label}
            required={required}
          />
        )}
      />

      <ErrorMessage name={name} />
    </>
  );
};

export interface Option {
  text: string;
  value: string | number;
}

export default connect<TProps>(FormikAutocomplete);
