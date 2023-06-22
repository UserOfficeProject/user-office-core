import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import React from 'react';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import UOLoader from 'components/common/UOLoader';
import { InternalReview, UserRole } from 'generated/sdk';
import { useUsersData } from 'hooks/user/useUsersData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';

const useStyles = makeStyles((theme) => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type CreateUpdateInternalReviewProps = {
  close: (internalReviewAdded: InternalReview | null) => void;
  internalReview: InternalReview | null;
  technicalReviewId?: number | null;
};

const CreateUpdateInternalReview = ({
  close,
  internalReview,
  technicalReviewId,
}: CreateUpdateInternalReviewProps) => {
  const classes = useStyles();
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { usersData } = useUsersData({
    userRole: UserRole.INSTRUMENT_SCIENTIST,
  });

  console.log(internalReview);

  if (!usersData) {
    return <UOLoader />;
  }

  const initialValues = internalReview
    ? internalReview
    : {
        title: '',
        comment: '',
        files: '',
        reviewerId: null,
      };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        if (values.reviewerId === null || !technicalReviewId) {
          return;
        }

        if (internalReview) {
          try {
            const { updateInternalReview } = await api({
              toastSuccessMessage: 'Internal review  updated successfully!',
            }).updateInternalReview({
              input: {
                ...values,
                id: internalReview.id,
                technicalReviewId: technicalReviewId,
                files: JSON.stringify(values.files),
              },
            });

            close(updateInternalReview as InternalReview);
          } catch (error) {
            close(null);
          }
        } else {
          try {
            const { createInternalReview } = await api({
              toastSuccessMessage: 'Internal review created successfully!',
            }).createInternalReview({
              input: {
                ...values,
                technicalReviewId: technicalReviewId,
                files: JSON.stringify(values.files),
              },
            });

            close(createInternalReview as InternalReview);
          } catch (error) {
            close(null);
          }
        }
      }}
    >
      {() => (
        <Form>
          <Typography variant="h6" component="h1">
            {internalReview ? 'Update ' : 'Create new internal review'}
          </Typography>
          <Field
            name="title"
            id="title"
            label="Title"
            type="text"
            component={TextField}
            fullWidth
            data-cy="title"
            disabled={isExecutingCall}
            required
          />

          <FormikUIAutocomplete
            name="reviewerId"
            label="Internal reviewer"
            noOptionsText="No one"
            items={usersData.users.map((user) => ({
              text: getFullUserName(user),
              value: user.id,
            }))}
            InputProps={{
              'data-cy': 'internal-reviewer',
            }}
            required
          />

          <Button
            type="submit"
            fullWidth
            className={classes.submit}
            data-cy="submit"
            disabled={isExecutingCall}
          >
            {isExecutingCall && <UOLoader size={14} />}
            {internalReview ? 'Update' : 'Create'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default CreateUpdateInternalReview;
