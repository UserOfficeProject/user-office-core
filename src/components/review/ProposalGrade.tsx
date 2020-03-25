import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { useState } from 'react';
import { Redirect } from 'react-router';
import * as Yup from 'yup';
import { useDataApi } from '../../hooks/useDataApi';
import { useReviewData } from '../../hooks/useReviewData';
import { StyledPaper } from '../../styles/StyledComponents';
import { useSnackbar } from 'notistack';
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

export default function ProposalGrade(props: {reviewID: number}) {
  const classes = useStyles();
  const { loading, reviewData } = useReviewData(props.reviewID);
  const [submitted, setSubmitted] = useState(false);
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  if (!reviewData) {
    return <p>Loading</p>;
  }

  return (
    <Container maxWidth="lg">
      <StyledPaper>
        <Formik
          initialValues={{
            grade: reviewData.grade,
            comment: reviewData.comment,
          }}
          onSubmit={async (values, actions) => {
            await api().addReview({
              reviewID: props.reviewID,
              //This should be taken care of in validationSchema
              grade: values.grade ? values.grade : 0,
              comment: values.comment ? values.comment: ""
            });
            enqueueSnackbar('Updated', { variant: 'success' })
            actions.setSubmitting(false);
          }}
          validationSchema={Yup.object().shape({
            comment: Yup.string()
              .min(10, 'Too short comment')
              .max(500, 'Too long comment')
              .required('Comment to be between 10-500 characters'),
            grade: Yup.number()
              .min(0, 'Lowest grade is 0')
              .max(10, 'Highest grade is 10')
              .required('Set grade between 0-10'),
          })}
        >
          {({ isSubmitting, handleSubmit }) => (
          <Form>
            <CssBaseline />
              <Field
                name="comment"
                label="Comment"
                type="text"
                component={TextField}
                margin="normal"
                fullWidth
                disabled={reviewData.status === 'SUBMITTED'}
              />
              <Field
                name="grade"
                label="Grade"
                type="number"
                component={TextField}
                margin="normal"
                fullWidth
                disabled={reviewData.status === 'SUBMITTED'}
              />
            <ButtonContainer>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="contained"
                color="primary"
              >
                Save
              </Button>
              <Button
                className={classes.button}
                disabled={isSubmitting}
                type="submit"
                variant="contained"
                color="primary"
              >
                Submit
              </Button>
            </ButtonContainer>
          </Form>
          )}
        </Formik>
      </StyledPaper>
    </Container>
  );
}
