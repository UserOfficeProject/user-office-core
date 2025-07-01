import { FormControl, InputLabel } from '@mui/material';
import { Field } from 'formik';
import React from 'react';

import Select from 'components/common/FormikUISelect';
import TitledContainer from 'components/common/TitledContainer';
import { FieldConfig, GetRolesQuery } from 'generated/sdk';

export const QuestionReadPermissionsConfig = ({
  rolesData,
}: {
  config: FieldConfig;
  rolesData: GetRolesQuery['roles'];
}) => {
  console.log(rolesData);

  return (
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
  );
};
