import { Autocomplete, Button, Chip, TextField } from '@mui/material';
import { Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { Tag } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { RoleRow } from './RoleManagement';

export interface AssignTagsFormProps {
  role: RoleRow;
  close: () => void;
  onAssign: () => void;
}

const AssignTagsForm = ({ role, close, onAssign }: AssignTagsFormProps) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const [allTags, setAllTags] = useState<Pick<Tag, 'id' | 'name'>[]>([]);

  useEffect(() => {
    let unmounted = false;

    api()
      .getTags()
      .then((data) => {
        if (unmounted) return;
        setAllTags(data.tags || []);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return (
    <Formik
      initialValues={{ selectedTags: role.tags || [] }}
      enableReinitialize
      onSubmit={async (values) => {
        try {
          await api().updateRoleTags({
            roleId: role.id,
            tagIds: values.selectedTags.map((tag) => tag.id),
          });
          onAssign();
          close();
        } catch (error) {
          console.error('Error assigning tags:', error);
        }
      }}
    >
      {({ values, setFieldValue }) => (
        <Form>
          <Autocomplete
            multiple
            id="tags-filled"
            options={allTags}
            getOptionLabel={(option) => option.name}
            value={values.selectedTags}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_event, newValue) => {
              setFieldValue('selectedTags', newValue);
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  sx={{ gap: '3px', padding: '6px', margin: '6px' }}
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} placeholder="Select tags" />
            )}
          />

          <Button
            type="submit"
            fullWidth
            sx={(theme) => ({ margin: theme.spacing(3, 0, 2) })}
            disabled={isExecutingCall}
            data-cy="assign-selected-tags"
          >
            {isExecutingCall && <UOLoader size={14} />}
            Assign
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default AssignTagsForm;
