import Button from '@mui/material/Button';
import { Field, Form, Formik } from 'formik';
import React from 'react';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import TextField from 'components/common/FormikUITextField';
import UOLoader from 'components/common/UOLoader';
import { Permission } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { useTagsData } from 'hooks/tag/useTagsData';
import { useRolesData } from 'hooks/user/useRolesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type EditPermissionProps = {
  close: (permissionAdded: Permission | null) => void;
  permission: Permission | null;
};

const EditPermission = ({ close, permission }: EditPermissionProps) => {
  const { isExecutingCall } = useDataApiWithFeedback();

  const { calls, loadingCalls } = useCallsData();
  const { loadingInstruments, instruments } = useInstrumentsData();
  const { tags, loadingTags } = useTagsData();
  const { rolesData, loading } = useRolesData();

  const initialValues = permission
    ? permission
    : {
        role: '',
        object: '',
        action: '',
        call: '',
        instrument_ids: '',
        instrument_operator: '',
        facility: '',
        custom_filter: '',
      };

  const operatorOptions = ['AND', 'OR'];

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (): Promise<void> => {
        close(null);
      }}
    >
      {() => (
        <Form>
          <FormikUIAutocomplete
            name="role"
            label="Role"
            loading={loading}
            noOptionsText="No templates"
            items={
              rolesData
                ? rolesData.map((op) => ({ text: op.title, value: op.id }))
                : []
            }
            required
          />
          <Field
            name="object"
            label="Object"
            type="text"
            component={TextField}
            fullWidth
            disabled={isExecutingCall}
            required
          />
          <Field
            name="action"
            label="Action"
            type="text"
            component={TextField}
            fullWidth
            disabled={isExecutingCall}
            required
          />
          <FormikUIAutocomplete
            name="call"
            label="Calls"
            loading={loadingCalls}
            noOptionsText="No templates"
            items={calls.map((op) => ({ text: op.shortCode, value: op.id }))}
            required
          />
          <FormikUIAutocomplete
            name="instrument_ids"
            label="Instruments"
            loading={loadingInstruments}
            noOptionsText="No templates"
            items={instruments.map((op) => ({
              text: op.shortCode,
              value: op.id,
            }))}
            required
          />
          <FormikUIAutocomplete
            name="instrument_operator"
            label="Instruments operator"
            noOptionsText="No templates"
            items={operatorOptions.map((op) => ({ text: op, value: op }))}
            required
          />
          <FormikUIAutocomplete
            name="facility"
            label="Facility"
            loading={loadingTags}
            noOptionsText="No templates"
            items={tags.map((op) => ({ text: op.name, value: op.id }))}
            required
          />
          <Field
            name="custom_filter"
            label="Custom filter"
            type="text"
            component={TextField}
            fullWidth
            disabled={isExecutingCall}
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

export default EditPermission;
