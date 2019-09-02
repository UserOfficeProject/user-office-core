import React from "react";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { Formik, Field, Form } from "formik";
import { TextField } from "formik-material-ui";
import * as Yup from "yup";
import { useAddCall } from "../hooks/useAddCall";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";

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
  const currentDay = new Date();
  const DatePickerField = ({ field, form, ...other }) => {
    const currentError = form.errors[field.name];

    return (
      <KeyboardDatePicker
        name={field.name}
        value={field.value}
        format="yyyy-MM-dd"
        helperText={currentError}
        error={Boolean(currentError)}
        onError={error => {
          // handle as a side effect
          if (error !== currentError) {
            form.setFieldError(field.name, error);
          }
        }}
        // if you are using custom validation schema you probably want to pass `true` as third argument
        onChange={date => form.setFieldValue(field.name, date, false)}
        {...other}
      />
    );
  };
  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={{
          shortCode: "",
          start: currentDay,
          end: currentDay,
          startReview: currentDay,
          endReview: currentDay,
          startNotify: currentDay,
          endNotify: currentDay,
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
          shortCode: Yup.string().required("Short Code is required"),
          start: Yup.date().required("Date is required"),
          end: Yup.date().required("Date is required"),
          startReview: Yup.date().required("Date is required"),
          endReview: Yup.date().required("Date is required"),
          startNotify: Yup.date().required("Date is required"),
          endNotify: Yup.date().required("Date is required"),
          cycleComment: Yup.string().required("Date is required"),
          surveyComment: Yup.string().required("Date is required")
        })}
      >
        {({ values, errors, handleChange }) => (
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
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Field
                name="start"
                label="Start"
                component={DatePickerField}
                margin="normal"
                fullWidth
              />

              <Field
                name="end"
                label="End"
                component={DatePickerField}
                margin="normal"
                fullWidth
              />
              <Field
                name="startReview"
                label="Start of review"
                component={DatePickerField}
                margin="normal"
                fullWidth
              />
              <Field
                name="endReview"
                label="End of review"
                component={DatePickerField}
                margin="normal"
                fullWidth
              />
              <Field
                name="startNotify"
                label="Start of notification period"
                component={DatePickerField}
                margin="normal"
                fullWidth
              />
              <Field
                name="endNotify"
                label="End of notification period"
                component={DatePickerField}
                margin="normal"
                fullWidth
              />
            </MuiPickersUtilsProvider>
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
        )}
      </Formik>
    </Container>
  );
}
