import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Field } from 'formik';
import React, { useState } from 'react';

import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import Select from 'components/common/FormikUISelect';
import TitledContainer from 'components/common/TitledContainer';
import { TechniquePickerConfig } from 'generated/sdk';
const availableVariantOptions = [
  { label: 'Radio', value: 'radio' },
  { label: 'Dropdown', value: 'dropdown' },
];
export const QuestionTechniquePickerFormCommon = ({
  config,
}: {
  config: TechniquePickerConfig;
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
              component={CheckboxWithLabel}
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
                component={CheckboxWithLabel}
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
