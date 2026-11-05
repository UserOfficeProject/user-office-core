import { InputLabel } from '@mui/material';
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
  return (
    <TitledContainer label="Read Permissions">
      <InputLabel htmlFor="config.readPermissions" shrink>
        Select specific roles to restrict the permission to access this question
      </InputLabel>
      <Field
        id="config.readPermissions"
        name="config.readPermissions"
        type="text"
        multiple
        onClose={(event: React.SyntheticEvent) => {
          event.preventDefault();
        }}
        renderValue={(selected?: string[] | string) => {
          if (typeof selected === 'string') {
            return selected;
          }

          return selected?.join(', ') || 'All Roles';
        }}
        component={Select}
        data-cy="read-permissions"
        options={
          rolesData?.map((role) => ({
            text: role.title,
            value: role.isRootRole ? role.shortCode : String(role.id),
          })) ?? []
        }
        isMultiSelect={true}
        displayEmpty={true}
      />
    </TitledContainer>
  );
};
