import { KeyboardDatePicker } from '@material-ui/pickers';
import { default as React } from 'react';

const FormikUICustomDatePicker = ({
  field,
  form,
  ...other
}: {
  field: { name: string; value: string };
  form: any;
  label: string;
}) => {
  const currentError = form.errors[field.name];

  return (
    <KeyboardDatePicker
      name={field.name}
      value={field.value}
      format="yyyy-MM-dd"
      placeholder="2020-11-27"
      helperText={currentError}
      error={Boolean(currentError)}
      onError={error => {
        // handle as a side effect
        if (error && error !== currentError) {
          form.setFieldError(field.name, error);
        }
      }}
      // if you are using custom validation schema you probably want to pass `true` as third argument
      onChange={date => form.setFieldValue(field.name, date, false)}
      {...other}
    />
  );
};

export default FormikUICustomDatePicker;
