import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-material-ui";
import React, { useState } from "react";
import { Redirect } from "react-router";
import * as Yup from "yup";
import { useProposalData } from "../hooks/useProposalData";
import { useReviewData } from "../hooks/useReviewData";
import { StyledPaper } from "../styles/StyledComponents";
import ProposaQuestionaryReview from "./ProposalQuestionaryReview";
import { useDataApi } from "../hooks/useDataApi";

const useStyles = makeStyles(theme => ({
  buttons: {
    display: "flex",
    justifyContent: "flex-end"
  },
  button: {
    marginTop: "25px",
    marginLeft: "10px"
  }
}));

export default function ProposalGrade({ match }) {
  const classes = useStyles();
  const { loading, reviewData } = useReviewData(parseInt(match.params.id));
  const [submitted, setSubmitted] = useState(false);
  const { proposalData } = useProposalData(reviewData?.proposal?.id);
  const api = useDataApi();

  if (submitted) {
    return <Redirect push to={`/ProposalTableReviewer/`} />;
  }

  if (loading) {
    return <p>Loading</p>;
  }

  if (!proposalData) {
    return <p>Loading</p>;
  }
  return (
    <Container maxWidth="lg" className={classes.container}>
      <StyledPaper>
        <ProposaQuestionaryReview data={proposalData} />
      </StyledPaper>

      <StyledPaper>
        <Formik
          initialValues={{
            grade: reviewData.grade,
            comment: reviewData.comment
          }}
          onSubmit={async (values, actions) => {
            await api().addReview({
              reviewID: parseInt(match.params.id),
              grade: values.grade,
              comment: values.comment
            });
            setSubmitted(true);
            actions.setSubmitting(false);
          }}
          validationSchema={Yup.object().shape({
            comment: Yup.string()
              .min(10, "Too short comment")
              .max(500, "Too long comment")
              .required("Comment to be between 10-500 characters"),
            grade: Yup.number()
              .min(0, "Lowest grade is 0")
              .max(10, "Highest grade is 10")
              .required("Set grade between 0-10")
          })}
        >
          <Form>
            <CssBaseline />
            <div className={classes.paper}>
              <Field
                name="comment"
                label="Comment"
                type="text"
                component={TextField}
                margin="normal"
                fullWidth
                disabled={reviewData.status === "SUBMITTED"}
              />
              <Field
                name="grade"
                label="Grade"
                type="number"
                component={TextField}
                margin="normal"
                fullWidth
                disabled={reviewData.status === "SUBMITTED"}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={reviewData.status === "SUBMITTED"}
              >
                Submit
              </Button>
            </div>
          </Form>
        </Formik>
      </StyledPaper>
    </Container>
  );
}
