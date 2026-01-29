import Button from '@mui/material/Button';
import { Field, Form, Formik } from 'formik';
import React from 'react';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import TextField from 'components/common/FormikUITextField';
import UOLoader from 'components/common/UOLoader';
import { AccessRule } from 'generated/sdk';
import { useRolesData } from 'hooks/user/useRolesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type EditAccessProps = {
  close: (accessAdded: AccessRule | null) => void;
  access: AccessRule | null;
};

const EditAccess = ({ close, access }: EditAccessProps) => {
  const { isExecutingCall } = useDataApiWithFeedback();
  const { rolesData, loading } = useRolesData();

  const initialValues = access
    ? access
    : {
        role: '',
        subject: '',
        action: '',
        conditions: '',
      };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (): Promise<void> => {
        close(null);
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
            required
          />
          <Button
            type="submit"
            fullWidth
            sx={(theme) => ({
              margin: theme.spacing(3, 0, 2),
            })}
            data-cy="submit"
            disabled={true}
          >
            {isExecutingCall && <UOLoader size={14} />}
            Update
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default EditAccess;