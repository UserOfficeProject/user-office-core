import { Button, Typography } from '@mui/material';
import { Field, Form, Formik, FormikValues } from 'formik';
import React from 'react';
import { number, object, string } from 'yup';

import TextField from 'components/common/FormikUITextField';
import UOLoader from 'components/common/UOLoader';
import {
  CreateTagMutationVariables,
  UpdateTagMutationVariables,
} from 'generated/sdk';
import { TagData } from 'hooks/tag/useTagsData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type CreateUpdateTagProps = {
  close: (Tag: TagData | null) => void;
  tag: TagData | null;
};

export const CreateUpdateTag = ({ tag, close }: CreateUpdateTagProps) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const initialValues = tag ?? {
    name: '',
    shortCode: '',
    instruments: [],
    users: [],
  };
  const updateTagValidationSchema = object().shape({
    id: number().required(),
    name: string().required('Name is required'),
    shortCode: string().required('Short code is required'),
  });

  const createTagValidationSchema = object().shape({
    name: string().required('Name is required'),
    shortCode: string().required('Short code is required'),
  });

  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values: FormikValues): Promise<void> => {
          if (tag) {
            const result = await api({
              toastSuccessMessage: 'Tag updated successfully!',
            }).updateTag(values as UpdateTagMutationVariables);
            close({
              ...result.updateTag,
              instruments: tag.instruments,
            } as TagData);
          } else {
            const result = await api({
              toastSuccessMessage: 'Tag created successfully!',
            }).createTag(values as CreateTagMutationVariables);
            close({
              ...result.createTag,
              instruments: [],
              calls: [],
            } as TagData);
          }
        }}
        validationSchema={
          tag ? updateTagValidationSchema : createTagValidationSchema
        }
      >
        {() => (
          <Form>
            <Typography variant="h6" component="h1">
              {tag ? 'Update the Tag' : 'Create new Tag'}
            </Typography>
            <Field
              name="name"
              id="name"
              label="Name"
              component={TextField}
              type="text"
              data-cy="tag-name"
              disabled={isExecutingCall}
              fullWidth
              required
            />
            <Field
              name="shortCode"
              id="shortCode"
              label="Short code"
              type="text"
              component={TextField}
              data-cy="shortCode"
              disabled={isExecutingCall}
              fullWidth
              required
            />
            <Button
              type="submit"
              sx={{ marginTop: 2 }}
              fullWidth
              data-cy="submit"
              disabled={isExecutingCall}
            >
              {isExecutingCall && <UOLoader size={14} />}
              {tag ? 'Update' : 'Create'}
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};
