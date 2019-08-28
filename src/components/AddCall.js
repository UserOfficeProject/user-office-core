import React from "react";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { Formik, Field, Form } from "formik";
import { TextField } from "formik-material-ui";
import * as Yup from "yup";
import { useAddCall } from "../hooks/useAddCall";

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  cardHeader: {
    fontSize: "18px",
    padding: "22px 0 0 12px"
  },
  heading: {
    textAlign: "center"
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

export default function AddCall(props) {
  const classes = useStyles();
  const sendAddCall = useAddCall();

  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={{
          shortCode: "",
          start: "",
          end: "",
          startReview: "",
          endReview: "",
          startNotify: "",
          endNotify: "",
          cycleComment: "",
          surveyComment: ""
        }}
        onSubmit={async (values, actions) => {
          const {
            shortCode,
            start,
            end,
            startReview,
            endReview,
            startNotify,
            endNotify,
            cycleComment,
            surveyComment
          } = values;
          sendAddCall(
            shortCode,
            start,
            end,
            startReview,
            endReview,
            startNotify,
            endNotify,
            cycleComment,
            surveyComment
          );
          actions.setSubmitting(false);
          props.close();
        }}
        validationSchema={Yup.object().shape({
          shortCode: Yup.string().required("Short Code is required")
        })}
      >
        <Form>
          <Typography className={classes.cardHeader}>
            Call information
          </Typography>

          <Field
            name="shortCode"
            label="Short Code"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
          />
          <Field
            name="start"
            label="Start"
            type="date"
            component={TextField}
            margin="normal"
            fullWidth
          />
          <Field
            name="end"
            label="End"
            type="date"
            component={TextField}
            margin="normal"
            fullWidth
          />
          <Field
            name="startReview"
            label="Start of review"
            type="date"
            component={TextField}
            margin="normal"
            fullWidth
          />
          <Field
            name="endReview"
            label="End of review"
            type="date"
            component={TextField}
            margin="normal"
            fullWidth
          />
          <Field
            name="startNotify"
            label="Start of notification period"
            type="date"
            component={TextField}
            margin="normal"
            fullWidth
          />
          <Field
            name="endNotify"
            label="End of notification period"
            type="date"
            component={TextField}
            margin="normal"
            fullWidth
          />
          <Field
            name="cycleComment"
            label="Cycle comment"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
          />
          <Field
            name="surveyComment"
            label="Survey Comment"
            type="text"
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
            Add Call
          </Button>
        </Form>
      </Formik>
    </Container>
  );
}
