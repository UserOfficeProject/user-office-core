import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import ProposaQuestionaryReview from "./ProposalQuestionaryReview";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import { Formik, Field, Form } from "formik";
import CssBaseline from "@material-ui/core/CssBaseline";
import { TextField } from "formik-material-ui";
import * as Yup from "yup";
import { useAddReview } from "../hooks/useAddReview";
import { useReviewData } from "../hooks/useReviewData";
import { Redirect } from "react-router";
import { useProposalData } from "../hooks/useProposalData";

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3)
    }
  },
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
  const { proposalData } = useProposalData(match.params.id);

  const sendAddReview = useAddReview();

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
      <Paper className={classes.paper}>
        <ProposaQuestionaryReview data={proposalData} />
      </Paper>

      <Paper className={classes.paper}>
        <Formik
          initialValues={{
            grade: reviewData.grade,
            comment: reviewData.comment
          }}
          onSubmit={async (values, actions) => {
            await sendAddReview(
              parseInt(match.params.id),
              values.grade,
              values.comment
            );
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
              />
              <Field
                name="grade"
                label="Grade"
                type="number"
                component={TextField}
                margin="normal"
                fullWidth
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Submit
              </Button>
            </div>
          </Form>
        </Formik>
      </Paper>
    </Container>
  );
}
