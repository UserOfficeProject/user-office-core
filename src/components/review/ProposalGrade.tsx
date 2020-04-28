import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import { Field, Form, Formik } from 'formik';
import { TextField, Select } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';

import { ReviewStatus, Review } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useReviewData } from '../../hooks/useReviewData';
import { ButtonContainer } from '../../styles/StyledComponents';

const useStyles = makeStyles(theme => ({
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
  onChange: any;
}) {
  const classes = useStyles();
  const { reviewData } = useReviewData(props.reviewID);
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [review, setReview] = useState<Review | null>(null);

  useEffect(() => {
    setReview(reviewData);
  }, [reviewData]);

  if (!review) {
    return <p>Loading</p>;
  }

  return (
    <Formik
      initialValues={{
        grade: review.grade,
        comment: review.comment,
        saveOnly: true,
      }}
      onSubmit={async (values, actions) => {
        await api()
          .updateReview({
            reviewID: props.reviewID,
            //This should be taken care of in validationSchema
            grade: values.grade ? values.grade : 0,
            comment: values.comment ? values.comment : '',
            status: values.saveOnly
              ? ReviewStatus.DRAFT
              : ReviewStatus.SUBMITTED,
          })
          .then(data => {
            if (data.addReview.error) {
              enqueueSnackbar(data.addReview.error, { variant: 'error' });
            } else {
              enqueueSnackbar('Updated', { variant: 'success' });
              setReview(data.addReview.review);
            }
            props.onChange();
            actions.setSubmitting(false);
          });
      }}
      validationSchema={Yup.object().shape({
        comment: Yup.string()
          .max(500, 'Too long comment')
          .nullable(),
        grade: Yup.number()
          .min(0, 'Lowest grade is 0')
          .max(10, 'Highest grade is 10')
          .nullable(),
      })}
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
            margin="normal"
            disabled={review.status === 'SUBMITTED'}
          >
            {[...Array(10)].map((e, i) => (
              <MenuItem value={i + 1} key={`item-${i}`}>
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
                setFieldValue('saveOnly', false, false);
                handleSubmit();
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
