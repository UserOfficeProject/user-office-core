import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Field, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { TextField } from 'formik-mui';
import React, { useContext, useEffect, useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import Editor from 'components/common/TinyEditor';
import UOLoader from 'components/common/UOLoader';
import { FeatureContext } from 'context/FeatureContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { FeatureId, InternalReview, UserRole } from 'generated/sdk';
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
  technicalReviewSubmitted?: boolean;
};

const CreateUpdateInternalReview = ({
  close,
  internalReview,
  technicalReviewId,
  technicalReviewSubmitted,
}: CreateUpdateInternalReviewProps) => {
  const classes = useStyles();
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const isInternalReviewer = useCheckAccess([UserRole.INTERNAL_REVIEWER]);
  const { user } = useContext(UserContext);
  const [usersData, setUsersData] = useState(
    internalReview?.reviewerId ? [internalReview?.reviewer] : []
  );
  const featureContext = useContext(FeatureContext);
  const isUserSurnameSearchEnabled = !!featureContext.featuresMap.get(
    FeatureId.USER_SEARCH_FILTER
  )?.isEnabled;

  // if (!usersData) {
  //   return <UOLoader />;
  // }

  const initialValues = internalReview
    ? {
        title: internalReview.title,
        comment: internalReview.comment || '',
        files: internalReview.files,
        reviewerId: internalReview.reviewerId,
        surname: '',
      }
    : {
        title: '',
        comment: '',
        files: '',
        reviewerId: null,
        surname: '',
      };

  const formDisabled =
    (isInternalReviewer && user.id !== internalReview?.reviewerId) ||
    (isInternalReviewer && technicalReviewSubmitted);

  useEffect(() => {
    if (!isUserSurnameSearchEnabled) {
      api()
        .getUsers({ userRole: UserRole.INTERNAL_REVIEWER })
        .then((data) => {
          setUsersData(data.users?.users || []);
        });
    }
  }, [isUserSurnameSearchEnabled, api]);

  const findUserBySurname = async (
    value: string,
    setFieldError: (field: string, message: string | undefined) => void
  ) => {
    if (!value) {
      return;
    }

    try {
      await api()
        .getUsers({ filter: value })
        .then((data) => {
          if (data.users?.totalCount == 0) {
            setFieldError('surname', 'No users found with that surname');
          } else {
            setUsersData(data.users?.users || []);
          }
        });
    } catch (error) {
      close(null);
    }
  };

  type formikProps = FormikProps<typeof initialValues> &
    FormikHelpers<typeof initialValues>;

  const SurnameSearchField = (props: formikProps) => {
    const { values, setFieldError } = props;

    return isUserSurnameSearchEnabled ? (
      <Stack direction="row" spacing={1} alignItems="baseline">
        <Field
          id="surname"
          name="surname"
          label="Surname"
          type="text"
          component={TextField}
          fullWidth
          flex="1"
          data-cy="internal-reviewer-surname"
        />
        <Button
          data-cy="findUser"
          type="button"
          disabled={!values.surname}
          onClick={() => findUserBySurname(values.surname, setFieldError)}
          sx={{ minWidth: 'fit-content' }}
        >
          Find User
        </Button>
      </Stack>
    ) : null;
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
                comment: values.comment,
                reviewerId: values.reviewerId,
                title: values.title,
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
                comment: values.comment,
                reviewerId: values.reviewerId,
                title: values.title,
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
      {(formikProps) => (
        <Form>
          <Typography variant="h6" component="h1">
            {internalReview
              ? isInternalReviewer
                ? `Internal review`
                : 'Update'
              : 'Create new internal review'}
          </Typography>

          {!isInternalReviewer ? (
            <Field
              name="title"
              id="title"
              label="Title"
              type="text"
              component={TextField}
              fullWidth
              data-cy="title"
              disabled={isExecutingCall || formikProps.isSubmitting}
              required
            />
          ) : (
            <>
              <InputLabel
                htmlFor="internal_review_title"
                shrink
                className={classes.comment}
              >
                Title
              </InputLabel>

              <Typography variant="body1" gutterBottom data-cy="title">
                {internalReview?.title}
              </Typography>
            </>
          )}
          {!isInternalReviewer ? <SurnameSearchField {...formikProps} /> : null}
          {!isInternalReviewer ? (
            <FormikUIAutocomplete
              name="reviewerId"
              label="Internal reviewer"
              noOptionsText="No one"
              items={usersData.map((user) => ({
                text: getFullUserName(user),
                value: user ? user.id : '',
              }))}
              data-cy="internal-reviewer"
              required
              disabled={isExecutingCall || formikProps.isSubmitting}
            />
          ) : (
            user.id !== internalReview?.reviewerId && (
              <>
                <InputLabel
                  htmlFor="internal_review_comment"
                  shrink
                  className={classes.comment}
                >
                  Reviewer
                </InputLabel>

                <Typography variant="body1" gutterBottom>
                  {getFullUserName(internalReview?.reviewer)}
                </Typography>
              </>
            )
          )}

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
                formikProps.setFieldValue('comment', content);
              }
            }}
            disabled={
              formikProps.isSubmitting || isExecutingCall || formDisabled
            }
          />

          {(!isInternalReviewer || user.id === internalReview?.reviewerId) && (
            <Button
              type="submit"
              fullWidth
              className={classes.submit}
              data-cy="submit"
              disabled={
                formikProps.isSubmitting || isExecutingCall || formDisabled
              }
            >
              {isExecutingCall && <UOLoader size={14} />}
              {internalReview ? 'Update' : 'Create'}
            </Button>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default CreateUpdateInternalReview;
