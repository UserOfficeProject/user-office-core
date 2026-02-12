import Button from '@mui/material/Button';
import { Field, Form, Formik } from 'formik';
import React from 'react';

import TextField from 'components/common/FormikUITextField';
import { PermissionRule } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type CreateUpdatePermissionProps = {
  close: (permissionRule: PermissionRule | null) => void;
  permission: PermissionRule | null;
};

const CreateUpdatePermission = ({ close, permission }: CreateUpdatePermissionProps) => {
  const { api } = useDataApiWithFeedback();

  const initialValues = permission
    ? permission
    : {
        role: '',
        subject: '',
        action: '',
        conditions: '',
      };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values) => {
        if (permission) {
          const { updatePermissionRule } = await api({
            toastSuccessMessage: 'Permission updated successfully!',
          }).updatePermissionRule({
            ...values, id: permission.id
          });
          close(updatePermissionRule as PermissionRule);
        } else {
          const { createPermissionRule } = await api({
            toastSuccessMessage: 'Permission created successfully!',
          }).createPermissionRule({
            ...values
          });

          close(createPermissionRule as PermissionRule);
        }
      }}
    >
      {() => (
        <Form>
          <Field
            name="role"
            label="Role"
            type="text"
            component={TextField}
            fullWidth
            required
          />
          <Field
            name="subject"
            label="Subject"
            type="text"
            component={TextField}
            fullWidth
            required
          />
          <Field
            name="action"
            label="Action"
            type="text"
            component={TextField}
            fullWidth
            required
          />
          <Field
            name="conditions"
            label="Conditions"
            type="text"
            component={TextField}
            fullWidth
          />
          <Button
            type="submit"
            fullWidth
            sx={(theme) => ({
              margin: theme.spacing(3, 0, 2),
            })}
            data-cy="submit"
          >
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default CreateUpdatePermission;