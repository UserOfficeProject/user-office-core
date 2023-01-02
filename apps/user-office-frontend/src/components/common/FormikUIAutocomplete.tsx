import RefreshIcon from '@mui/icons-material/Refresh';
import { IconButton, InputAdornment } from '@mui/material';
import { InputProps } from '@mui/material/Input';
import MuiTextField, {
  TextFieldProps as MUITextFieldProps,
} from '@mui/material/TextField';
import { Field } from 'formik';
import { Autocomplete } from 'formik-mui';
import React, { useState } from 'react';

import { Option } from 'utils/utilTypes';

type FormikUIAutocompleteProps = {
  items: Option[];
  name: string;
  label: string;
  loading?: boolean;
  noOptionsText?: string;
  required?: boolean;
  disabled?: boolean;
  TextFieldProps?: MUITextFieldProps;
  InputProps?: Partial<InputProps> & { 'data-cy': string };
  multiple?: boolean;
  'data-cy'?: string;
  reload?: () => void;
};

const FormikUIAutocomplete: React.FC<FormikUIAutocompleteProps> = ({
  items,
  name,
  label,
  loading = false,
  noOptionsText,
  required,
  disabled,
  InputProps,
  TextFieldProps,
  multiple = false,
  reload,
  ...props
}) => {
  const [adornmentVisible, setAdornmentVisible] = useState(false);
  const options = items.map((item) => item.value);

  return (
    <Field
      id={name + '-input'}
      name={name}
      component={Autocomplete}
      loading={loading}
      multiple={multiple}
      options={options}
      noOptionsText={noOptionsText}
      getOptionLabel={(option: number | string) => {
        const foundOption = items.find((item) => item.value === option);

        return foundOption?.text || '';
      }}
      renderInput={(params: MUITextFieldProps) => (
        <MuiTextField
          {...params}
          {...TextFieldProps}
          label={label}
          required={required}
          disabled={disabled}
          InputProps={{
            ...params.InputProps,
            ...InputProps,
            endAdornment: (
              <InputAdornment position="start">
                {adornmentVisible && reload ? (
                  <IconButton
                    edge="end"
                    title="Refresh"
                    aria-label="Refresh the list"
                  >
                    <RefreshIcon fontSize="small" onClick={reload} />
                  </IconButton>
                ) : null}
                {params.InputProps?.endAdornment}
              </InputAdornment>
            ),
          }}
          onFocus={() => {
            setAdornmentVisible(true);
          }}
          onBlur={() => {
            setAdornmentVisible(false);
          }}
        />
      )}
      ListboxProps={{ 'data-cy': props['data-cy'] + '-options' }}
      data-cy={props['data-cy']}
    />
  );
};

export default FormikUIAutocomplete;
