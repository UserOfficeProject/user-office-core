import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Field } from 'formik';
import { Checkbox, Select } from 'formik-mui';
import React, { useState } from 'react';

import TitledContainer from 'components/common/TitledContainer';
import { InstrumentPickerConfig } from 'generated/sdk';
const availableVariantOptions = [
  { label: 'Radio', value: 'radio' },
  { label: 'Dropdown', value: 'dropdown' },
];
export const QuestionInstrumentPickerFormCommon = ({
  config,
}: {
  config: InstrumentPickerConfig;
}) => {
  const [showIsMultipleSelectCheckbox, setShowIsMultipleSelectCheckbox] =
    useState(config.variant === 'dropdown');

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
            onChange={(e: SelectChangeEvent) => {
              setShowIsMultipleSelectCheckbox(e.target.value === 'dropdown');
            }}
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

        {showIsMultipleSelectCheckbox && (
          <FormControlLabel
            control={
              <Field
                name="config.isMultipleSelect"
                component={Checkbox}
                type="checkbox"
                inputProps={{ 'data-cy': 'is-multiple-select' }}
              />
            }
            label="Is multiple select"
          />
        )}
      </TitledContainer>
    </>
  );
};
