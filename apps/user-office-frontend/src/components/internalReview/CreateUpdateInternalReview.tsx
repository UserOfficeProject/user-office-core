import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Editor } from '@tinymce/tinymce-react';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import React, { useContext } from 'react';

import { useCheckAccess } from 'components/common/Can';
import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import { InternalReview, UserRole } from 'generated/sdk';
import { useUsersData } from 'hooks/user/useUsersData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';

const useStyles = makeStyles((theme) => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  comment: {
    marginTop: theme.spacing(2),
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
  const isInternalReviewer = useCheckAccess([UserRole.INTERNAL_REVIEWER]);
  const { user } = useContext(UserContext);
  const { usersData } = useUsersData({
    userRole: UserRole.INTERNAL_REVIEWER,
  });

  if (!usersData) {
    return <UOLoader />;
  }

  const initialValues = internalReview
    ? {
        title: internalReview.title,
        comment: internalReview.comment || '',
        files: internalReview.files,
        reviewerId: internalReview.reviewerId,
      }
    : {
        title: '',
        comment: '',
        files: '',
        reviewerId: null,
      };

  const shouldDisableComment = (isSubmitting: boolean) =>
    isSubmitting ||
    (isInternalReviewer && user.id !== internalReview?.reviewerId);

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
      {({ isSubmitting, setFieldValue }) => (
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
            disabled={isExecutingCall || isSubmitting || isInternalReviewer}
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
            disabled={isExecutingCall || isSubmitting || isInternalReviewer}
          />

          <InputLabel
            htmlFor="internal_review_comment"
            shrink
            className={classes.comment}
          >
            Internal review comment
          </InputLabel>
          <Editor
            id="internal_review_comment"
            initialValue={initialValues.comment}
            init={{
              skin: false,
              content_css: false,
              plugins: ['link', 'preview', 'code', 'charmap', 'wordcount'],
              toolbar: 'bold italic',
              branding: false,
            }}
            onEditorChange={(content, editor) => {
              const isStartContentDifferentThanCurrent =
                editor.startContent !== editor.contentDocument.body.innerHTML;

              if (isStartContentDifferentThanCurrent || editor.isDirty()) {
                setFieldValue('comment', content);
              }
            }}
            disabled={isExecutingCall || shouldDisableComment(isSubmitting)}
          />

          <Button
            type="submit"
            fullWidth
            className={classes.submit}
            data-cy="submit"
            disabled={isExecutingCall || shouldDisableComment(isSubmitting)}
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
