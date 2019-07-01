import React, { useContext } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/styles";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { request } from "graphql-request";
import { AppContext } from "./App";

const useStyles = makeStyles({
  buttons: {
    display: "flex",
    justifyContent: "flex-end"
  },
  button: {
    marginTop: "25px",
    marginLeft: "10px"
  }
});

export default function ProposalInformation(props) {
  const { apiCall } = useContext(AppContext);

  const sendProposalUpdate = values => {
    const query = `
    mutation($id: ID!, $title: String!, $abstract: String!,) {
      updateProposal(id: $id, title: $title, abstract: $abstract){
       proposal{
        id
      }
        error
      }
    }
    `;

    const variables = {
      id: props.data.id,
      title: values.title,
      abstract: values.abstract
    };
    apiCall(query, variables).then(data => props.next(values));
  };

  const classes = useStyles();
  return (
    <Formik
      initialValues={{ title: props.data.title, abstract: props.data.abstract }}
      onSubmit={(values, actions) => {
        sendProposalUpdate(values);
      }}
      validationSchema={Yup.object().shape({
        title: Yup.string()
          .min(10, "Title must be at least 10 characters")
          .max(50, "Title must be at most 50 characters")
          .required("Title must be at least 10 characters"),
        abstract: Yup.string()
          .min(20, "Abstract must be at least 20 characters")
          .max(200, "Abstract must be at most 200 characters")
          .required("Abstract must be at least 20 characters")
      })}
    >
      {({ values, errors, touched, handleChange, isSubmitting }) => (
        <Form>
          <Typography variant="h6" gutterBottom>
            General Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                id="title"
                name="title"
                label="Title"
                defaultValue={values.title}
                fullWidth
                onChange={handleChange}
                error={touched.title && errors.title}
                helperText={touched.title && errors.title && errors.title}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                id="abstract"
                name="abstract"
                label="Abstract"
                defaultValue={values.abstract}
                fullWidth
                onChange={handleChange}
                error={touched.abstract && errors.abstract}
                helperText={
                  touched.abstract && errors.abstract && errors.abstract
                }
              />
            </Grid>
          </Grid>
          <div className={classes.buttons}>
            <Button
              disabled={isSubmitting}
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
            >
              Next
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
