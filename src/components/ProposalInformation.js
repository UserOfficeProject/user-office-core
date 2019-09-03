import React, { useContext } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormApi } from "./ProposalContainer";
import { useUpdateProposal } from "../hooks/useUpdateProposal";
import ProposalNavigationFragment from "./ProposalNavigationFragment";



export default function ProposalInformation(props) {
  const api = useContext(FormApi);
  const {loading, updateProposal} = useUpdateProposal();
  return (
    <Formik
      initialValues={{ title: props.data.title, abstract: props.data.abstract }}
      onSubmit={(values) => {
        updateProposal({
          id: props.data.id,
          title: values.title,
          abstract: values.abstract
        }).then(() => api.next());
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
      {({ values, errors, touched, handleChange }) => (
        <Form>
          <Typography variant="h6" gutterBottom>
            General Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                disabled={props.disabled}
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
                disabled={props.disabled}
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
          <ProposalNavigationFragment showSubmit={api.next !== null} isLoading={loading} />
        </Form>
      )}
    </Formik>
  );
}
