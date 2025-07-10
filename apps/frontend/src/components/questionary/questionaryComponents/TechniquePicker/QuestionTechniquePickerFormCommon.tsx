import { FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { Field } from 'formik';
import React, { useState } from 'react';

import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import Select from 'components/common/FormikUISelect';
import TitledContainer from 'components/common/TitledContainer';
import { GetRolesQuery, TechniquePickerConfig } from 'generated/sdk';
const availableVariantOptions = [
  { label: 'Radio', value: 'radio' },
  { label: 'Dropdown', value: 'dropdown' },
];
export const QuestionTechniquePickerFormCommon = ({
  rolesData,
  config,
}: {
  rolesData: GetRolesQuery['roles'];
  config: TechniquePickerConfig;
}) => {
  const [showIsMultipleSelectCheckbox, setShowIsMultipleSelectCheckbox] =
    useState(config.variant === 'dropdown');

  return (
    <>
      <TitledContainer label="Constraints">
        <Field
          name="config.required"
          component={CheckboxWithLabel}
          type="checkbox"
          Label={{
            label: 'Is required',
          }}
          data-cy="required"
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
            options={availableVariantOptions.map(({ label, value }) => ({
              text: label,
              value: value,
            }))}
          />
        </FormControl>

        {showIsMultipleSelectCheckbox && (
          <Field
            name="config.isMultipleSelect"
            component={CheckboxWithLabel}
            type="checkbox"
            Label={{
              label: 'Is multiple select',
            }}
            data-cy="is-multiple-select"
          />
        )}
      </TitledContainer>
      <TitledContainer label="Read Permissions">
        <FormControl fullWidth>
          <InputLabel htmlFor="config.readPermissions" shrink>
            Read Permissions
          </InputLabel>
          <Field
            id="config.readPermissions"
            name="config.readPermissions"
            type="text"
            multiple
            renderValue={(selected?: string[] | string) => {
              if (typeof selected === 'string') {
                return selected;
              }

              return selected?.join(', ') || '';
            }}
            component={Select}
            data-cy="read-permissions"
            options={
              rolesData?.map((role) => ({
                text: role.shortCode,
                value: role.shortCode,
              })) ?? []
            }
            isMultiSelect={true}
          />
        </FormControl>
      </TitledContainer>
    </>
  );
};
