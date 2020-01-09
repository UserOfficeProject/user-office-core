import React, { useContext, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormApi } from "./ProposalContainer";
import { useUpdateProposal } from "../hooks/useUpdateProposal";
import ProposalNavigationFragment from "./ProposalNavigationFragment";
import ProposalParticipants from "./ProposalParticipants";
import { useCreateProposal } from "../hooks/useCreateProposal";
import { makeStyles } from "@material-ui/core";
import { UserContext } from "../context/UserContextProvider";
import { User, BasicUserDetails } from "../models/User";
import { ProposalInformation } from "../models/ProposalModel";
import ProposalParticipant from "./ProposalParticipant";
import { getTranslation } from "@esss-swap/duo-localisation";
import TextFieldWithCounter from "./TextFieldWithCounter";

export default function ProposalInformationView(props: {
  data: ProposalInformation;
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

  const MAX_TITLE_LEN = 175;
  const MAX_ABSTRACT_LEN = 1500;

  const classes = makeStyles({
    disabled: {
      pointerEvents: "none",
      opacity: 0.7
    },
    pi: {
      marginTop: "30px",
      marginBottom: "30px"
    }
  })();

  const informDirty = (isDirty: boolean) => {
    props.setIsDirty && props.setIsDirty(isDirty);
  };
  console.log(props)
  return (
    <Formik
      initialValues={{
        title: props.data.title,
        abstract: props.data.abstract,
        proposer: props.data.proposer
      }}
      onSubmit={async values => {
        const userIds = users.map(user => user.id);
        if (
          values.proposer.id !== user.id &&
          !users.some((curUser: BasicUserDetails) => curUser.id === user.id)
        ) {
          setUserError(true);
        } else {
          var { id, status, shortCode } = props.data;
          if (!id) {
            ({ id, status, shortCode } = await createProposal());
          }
          const result = await updateProposal({
            id: id,
            status: status,
            title: values.title,
            abstract: values.abstract,
            users: userIds,
            proposerId: values.proposer.id
          });
          if (result && result.updateProposal && result.updateProposal.error) {
            api.reportStatus({
              variant: "error",
              message: getTranslation(result.updateProposal.error)
            });
          } else {
            api.next({
              ...values,
              id,
              status,
              users,
              shortCode,
              proposer: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                organisation: user.organisation
              }
            });
          }
        }
      }}
      validationSchema={Yup.object().shape({
        title: Yup.string()
          .max(MAX_TITLE_LEN, "Title must be at most 175 characters")
          .required("Title is required"),
        abstract: Yup.string()
          .max(MAX_ABSTRACT_LEN, "Abstract must be at most 1500 characters")
          .required("Abstract is required")
      })}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        submitForm,
        setFieldValue
      }) => (
        <Form className={props.readonly ? classes.disabled : undefined}>
          <Typography variant="h6" gutterBottom>
            Proposal information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextFieldWithCounter
                disabled={props.disabled}
                required
                id="title"
                name="title"
                label="Title"
                defaultValue={values.title}
                fullWidth
                onChange={e => {
                  handleChange(e);
                  informDirty(true);
                }}
                error={touched.title && errors.title !== undefined}
                helperText={touched.title && errors.title && errors.title}
                data-cy="title"
                maxLen={MAX_TITLE_LEN}
              />
            </Grid>
            <Grid item xs={12}>
              <TextFieldWithCounter
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
                  handleChange(e);
                  informDirty(true);
                }}
                error={touched.abstract && errors.abstract !== undefined}
                helperText={
                  touched.abstract && errors.abstract && errors.abstract
                }
                data-cy="abstract"
                maxLen={MAX_ABSTRACT_LEN}
              />
            </Grid>
          </Grid>
          <ProposalParticipant
            userChanged={(user: User) => {
              setFieldValue("proposer", user);
              informDirty(true);
            }}
            title="Principal investigator"
            className={classes.pi}
            userId={values.proposer.id}
          />
          <ProposalParticipants
            error={userError}
            setUsers={(users: User[]) => {
              setUsers(users);
              informDirty(true);
            }}
            users={users}
          />
          <ProposalNavigationFragment
            disabled={props.readonly}
            saveAndNext={{ callback: submitForm }}
            isLoading={creatingProposal || updatingProposal}
          />
        </Form>
      )}
    </Formik>
  );
}
