import { proposalGradeValidationSchema } from '@esss-swap/duo-validation/lib/Review';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Field, Form, Formik } from 'formik';
import { TextField, Select } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import React, { useState, useEffect, useContext } from 'react';

import UOLoader from 'components/common/UOLoader';
import { ReviewAndAssignmentContext } from 'context/ReviewAndAssignmentContextProvider';
import { ReviewStatus, CoreReviewFragment } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { useReviewData } from 'hooks/review/useReviewData';
import { ButtonContainer } from 'styles/StyledComponents';

const useStyles = makeStyles(() => ({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: '10px',
  },
}));

export default function ProposalGrade(props: {
  reviewID: number;
  onChange: Function;
}) {
  const classes = useStyles();
  const { reviewData } = useReviewData(props.reviewID);
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [review, setReview] = useState<CoreReviewFragment | null | undefined>(
    null
  );
  const { setAssignmentReview } = useContext(ReviewAndAssignmentContext);

  useEffect(() => {
    setReview(reviewData);
  }, [reviewData]);

  if (!review) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  return (
    <Formik
      initialValues={{
        grade: review.grade || '',
        comment: review.comment || '',
        saveOnly: true,
      }}
      onSubmit={async (values, actions) => {
        await api()
          .updateReview({
            reviewID: props.reviewID,
            //This should be taken care of in validationSchema
            grade: +values.grade,
            comment: values.comment ? values.comment : '',
            status: values.saveOnly
              ? ReviewStatus.DRAFT
              : ReviewStatus.SUBMITTED,
            sepID: review.sepID,
          })
          .then(data => {
            if (data.addReview.error) {
              enqueueSnackbar(data.addReview.error, { variant: 'error' });
            } else {
              enqueueSnackbar('Updated', { variant: 'success' });
              setReview(data.addReview.review);
              setAssignmentReview(data.addReview.review);
            }
            props.onChange();
            actions.setSubmitting(false);
          });
      }}
      validationSchema={proposalGradeValidationSchema}
    >
      {({ isSubmitting, setFieldValue, handleSubmit }) => (
        <Form>
          <CssBaseline />
          <Field
            name="comment"
            label="Comment"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            multiline
            rowsMax="16"
            rows="4"
            disabled={review.status === 'SUBMITTED'}
          />
          <InputLabel htmlFor="grade-proposal">Grade</InputLabel>
          <Field
            name="grade"
            inputProps={{
              id: 'grade-proposal',
            }}
            component={Select}
            disabled={review.status === 'SUBMITTED'}
          >
            {[...Array(10)].map((e, i) => (
              <MenuItem key={i} value={i + 1}>
                {i + 1}
              </MenuItem>
            ))}
          </Field>
          <ButtonContainer>
            <Button
              disabled={isSubmitting || review.status === 'SUBMITTED'}
              variant="contained"
              color="primary"
              onClick={() => {
                setFieldValue('saveOnly', true, false);
                handleSubmit();
              }}
            >
              Save
            </Button>
            <Button
              className={classes.button}
              disabled={isSubmitting || review.status === 'SUBMITTED'}
              variant="contained"
              color="secondary"
              onClick={() => {
                const confirmed = window.confirm(
                  'I am aware that no futhure changes to the grade is possible after submission.'
                );
                if (confirmed) {
                  setFieldValue('saveOnly', false, false);
                  handleSubmit();
                }
              }}
            >
              Submit
            </Button>
          </ButtonContainer>
        </Form>
      )}
    </Formik>
  );
}
