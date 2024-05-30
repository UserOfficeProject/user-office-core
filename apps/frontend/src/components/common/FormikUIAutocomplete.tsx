import Autocomplete from '@mui/material/Autocomplete';
import { InputProps } from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import MuiTextField, {
  TextFieldProps as MUITextFieldProps,
} from '@mui/material/TextField';
import { useField } from 'formik';
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
  InputProps?: Partial<InputProps> & {
    'data-cy'?: string;
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
  };
  multiple?: boolean;
  'data-cy'?: string;
  AdornmentIcon?: MUITextFieldProps;
  isOptionEqualToValue?: () => boolean;
};

const FormikUIAutocomplete = ({
  name,
  items,
  ...otherProps
}: FormikUIAutocompleteProps) => {
  const options = items.map((item) => item.value);
  const [field, meta, helpers] = useField(name);
  const [adornmentVisible, setAdornmentVisible] = useState(false);

  if (!name) {
    throw new Error(
      'FormikUISelect cannot be used without a required name property'
    );
  }

  if (!items) {
    throw new Error(
      'FormikUISelect cannot be used without a required options property'
    );
  }

  const configAutocomplete = {
    ...field,
    ...otherProps,
    multiple: otherProps.multiple || false,
    loading: otherProps.multiple || false,
  };

  const configTextField: MUITextFieldProps = {
    ...otherProps.TextFieldProps,
    name: name,
    label: otherProps.label,
    required: otherProps.required,
    disabled: otherProps.disabled,
    onBlur: () => helpers.setTouched(true, true),
  };

  if (meta && meta.touched && meta.error) {
    configTextField.error = true;
    configTextField.helperText = meta.error;
  }

  return (
    <Autocomplete
      id={name + '-input'}
      options={options}
      {...configAutocomplete}
      getOptionLabel={(option: number | string) => {
        const foundOption = items.find((item) => item.value === option);

        return foundOption?.text || '';
      }}
      onChange={(_, value) => {
        helpers.setTouched(true, false);
        helpers.setValue(value, true);
      }}
      renderInput={(params: MUITextFieldProps) => (
        <MuiTextField
          {...params}
          {...configTextField}
          InputProps={{
            ...params.InputProps,
            ...otherProps.InputProps,
            endAdornment: (
              <InputAdornment position="start">
                {otherProps.AdornmentIcon && adornmentVisible
                  ? { ...otherProps.AdornmentIcon }
                  : null}
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
          inputProps={{ 'data-cy': 'test' }}
        />
      )}
      ListboxProps={{ id: otherProps['data-cy'] + '-options' }}
      data-cy={otherProps['data-cy']}
      isOptionEqualToValue={otherProps.isOptionEqualToValue}
    />
  );

  // return (
  //   <Field
  //     id={name + '-input'}
  //     name={name}
  //     component={Autocomplete}
  //     loading={loading}
  //     multiple={multiple}
  //     options={options}
  //     noOptionsText={noOptionsText}
  //     getOptionLabel={(option: number | string) => {
  //       const foundOption = items.find((item) => item.value === option);

  //       return foundOption?.text || '';
  //     }}
  //     renderInput={(params: MUITextFieldProps) => (
  //       <MuiTextField
  //         {...params}
  //         {...TextFieldProps}
  //         label={label}
  //         required={required}
  //         disabled={disabled}
  //         InputProps={{
  //           ...params.InputProps,
  //           ...InputProps,
  //           endAdornment: (
  //             <InputAdornment position="start">
  //               {AdornmentIcon && adornmentVisible
  //                 ? { ...AdornmentIcon }
  //                 : null}
  //               {params.InputProps?.endAdornment}
  //             </InputAdornment>
  //           ),
  //         }}
  //         onFocus={() => {
  //           setAdornmentVisible(true);
  //         }}
  //         onBlur={() => {
  //           setAdornmentVisible(false);
  //         }}
  //       />
  //     )}
  //     ListboxProps={{ 'data-cy': props['data-cy'] + '-options' }}
  //     data-cy={props['data-cy']}
  //   />
  // );
};

export default FormikUIAutocomplete;
