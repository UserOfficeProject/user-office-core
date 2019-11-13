import React, { useContext, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormApi } from "./ProposalContainer";
import { useUpdateProposal } from "../hooks/useUpdateProposal";
import ProposalNavigationFragment from "./ProposalNavigationFragment";
import ProposalParticipants from "./ProposalParticipants";
import { useCreateProposal } from "../hooks/useCreateProposal";
import { makeStyles } from "@material-ui/core";
import { UserContext } from "../context/UserContextProvider";
import { User } from "../models/User";
import { ProposalStatus } from "../models/ProposalModel";

export default function ProposalInformationView(props: {
  data: {
    users?: User[];
    title: string;
    abstract: string;
    id: number;
    status: ProposalStatus;
  };
  readonly?: boolean;
  disabled?: boolean;
  setIsDirty?: (val: boolean) => void;
}) {
  const api = useContext(FormApi);
  const { loading: updatingProposal, updateProposal } = useUpdateProposal();
  const { loading: creatingProposal, createProposal } = useCreateProposal();
  const [users, setUsers] = useState(props.data.users || []);
  const [userError, setUserError] = useState(false);
  const { user } = useContext(UserContext);

  const classes = makeStyles({
    disabled: {
      pointerEvents: "none",
      opacity: 0.7
    }
  })();

  const informDirty = (isDirty: boolean) => {
    props.setIsDirty && props.setIsDirty(true);
  };

  return (
    <Formik
      initialValues={{
        title: props.data.title,
        abstract: props.data.abstract
      }}
      onSubmit={async values => {
        const userIds = users.map(user => user.id);
        if (users.length < 1) {
          setUserError(true);
        } else {
          var { id, status } = props.data;
          if (!id) {
            ({ id, status } = await createProposal());
          }
          await updateProposal({
            id: id,
            status: status,
            title: values.title,
            abstract: values.abstract,
            users: userIds
          });
          api.next({
            ...values,
            id,
            status,
            users,
            proposer: {
              id: user.id,
              firstname: user.firstname,
              surname: user.lastname
            }
          });
        }
      }}
      validationSchema={Yup.object().shape({
        title: Yup.string()
          .min(10, "Title must be at least 10 characters")
          .max(100, "Title must be at most 100 characters")
          .required("Title must be at least 10 characters"),
        abstract: Yup.string()
          .min(20, "Abstract must be at least 20 characters")
          .max(500, "Abstract must be at most 500 characters")
          .required("Abstract must be at least 20 characters")
      })}
    >
      {({ values, errors, touched, handleChange, submitForm }) => (
        <Form className={props.readonly ? classes.disabled : undefined}>
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
                onChange={e => {
                  informDirty(true);
                  handleChange(e);
                }}
                error={touched.title && errors !== undefined}
                helperText={touched.title && errors.title && errors.title}
                data-cy="title"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                disabled={props.disabled}
                required
                id="abstract"
                name="abstract"
                label="Abstract"
                multiline
                rowsMax="16"
                rows="4"
                defaultValue={values.abstract}
                fullWidth
                onChange={e => {
                  informDirty(true);
                  handleChange(e);
                }}
                error={touched.abstract && errors.abstract !== undefined}
                helperText={
                  touched.abstract && errors.abstract && errors.abstract
                }
                data-cy="abstract"
              />
            </Grid>
          </Grid>
          <ProposalParticipants
            error={userError}
            setUsers={(users: User[]) => {
              informDirty(true);
              setUsers(users);
            }}
            users={users}
          />
          <ProposalNavigationFragment
            disabled={props.readonly}
            next={submitForm}
            isLoading={creatingProposal || updatingProposal}
          />
        </Form>
      )}
    </Formik>
  );
}
