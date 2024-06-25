import MuiCheckbox, {
  CheckboxProps as MUICheckboxProps,
} from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useField } from 'formik';
import React from 'react';

const FormikUICheckboxWithLabel = ({
  name,
  label,
  ...otherProps
}: MUICheckboxProps & { label: string; 'data-cy'?: string }) => {
  if (!name) {
    throw new Error(
      'FormikUICheckboxWithLabel cannot be used without a required name property'
    );
  }

  if (!label) {
    throw new Error(
      'FormikUICheckboxWithLabel cannot be used without a required label property'
    );
  }

  const [field] = useField(name);

  if (typeof field.value !== 'boolean' && field.value !== undefined) {
    console.warn('FormikUICheckboxWithLabel expect boolean value or undefined');
  }

  const configCheckboxField: MUICheckboxProps = {
    ...field,
    ...otherProps,
  };

  return (
    <FormControlLabel
      control={
        <MuiCheckbox
          checked={configCheckboxField.value as boolean}
          {...configCheckboxField}
        />
      }
      data-cy={otherProps['data-cy']}
      label={label}
      disabled={otherProps.disabled}
    />
  );
};

export default FormikUICheckboxWithLabel;
