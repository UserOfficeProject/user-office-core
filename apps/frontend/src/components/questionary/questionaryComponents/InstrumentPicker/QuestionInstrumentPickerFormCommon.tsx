import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
} from '@mui/material';
import { Field } from 'formik';
import { Checkbox, Select } from 'formik-mui';
import React from 'react';

import TitledContainer from 'components/common/TitledContainer';
const availableVariantOptions = [
  { label: 'Radio', value: 'radio' },
  { label: 'Dropdown', value: 'dropdown' },
];
export const QuestionInstrumentPickerFormCommon = () => {
  return (
    <>
      <TitledContainer label="Constraints">
        <FormControlLabel
          control={
            <Field
              name="config.required"
              component={Checkbox}
              type="checkbox"
              inputProps={{ 'data-cy': 'required' }}
            />
          }
          label="Is required"
        />
      </TitledContainer>
      <TitledContainer label="Options">
        <FormControl fullWidth>
          <InputLabel htmlFor="config.variant" shrink>
            Variant
          </InputLabel>
          <Field
            id="config.variant"
            name="config.variant"
            type="text"
            component={Select}
            data-cy="variant"
          >
            {availableVariantOptions.map(({ value, label }) => {
              return (
                <MenuItem value={value} key={value}>
                  {label}
                </MenuItem>
              );
            })}
          </Field>
        </FormControl>
      </TitledContainer>
    </>
  );
};
