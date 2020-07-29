import { generalInfoUpdateValidationSchema } from '@esss-swap/duo-validation';
import { makeStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Form, Formik } from 'formik';
import React, { useContext, useState } from 'react';

import TextFieldWithCounter from 'components/common/TextFieldWithCounter';
import { UserContext } from 'context/UserContextProvider';
import { UserRole } from 'generated/sdk';
import { ProposalSubsetSumbission } from 'models/ProposalModel';
import { EventType } from 'models/ProposalSubmissionModel';
import { BasicUserDetails } from 'models/User';

import { ProposalSubmissionContext } from './ProposalContainer';
import ProposalNavigationFragment from './ProposalNavigationFragment';
import ProposalParticipant from './ProposalParticipant';
import ProposalParticipants from './ProposalParticipants';

export default function ProposalInformationView(props: {
  data: ProposalSubsetSumbission;
  readonly?: boolean;
  disabled?: boolean;
}) {
  const [userError, setUserError] = useState(false);
  const { user: currentUser, currentRole } = useContext(UserContext);
  const { dispatch } = useContext(ProposalSubmissionContext)!;
  const [users, setUsers] = useState<BasicUserDetails[]>(props.data.users);

  const MAX_TITLE_LEN = 175;
  const MAX_ABSTRACT_LEN = 1500;

  const classes = makeStyles({
    disabled: {
      pointerEvents: 'none',
      opacity: 0.7,
    },
    pi: {
      marginTop: '30px',
      marginBottom: '30px',
    },
  })();

  return (
    <Formik
      initialValues={{
        title: props.data.title,
        abstract: props.data.abstract,
        proposer: props.data.proposer,
        users: props.data.users,
      }}
      onSubmit={async values => {
        if (
          values.proposer.id !== currentUser.id &&
          !users.some((user: BasicUserDetails) => user.id === currentUser.id) &&
          currentRole !== UserRole.USER_OFFICER
        ) {
          setUserError(true);
        } else {
          dispatch({
            type: EventType.SAVE_GENERAL_INFO_CLICKED,
            payload: values,
          });
        }
      }}
      validationSchema={generalInfoUpdateValidationSchema}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        submitForm,
        setFieldValue,
        isSubmitting,
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
                onBlur={e => {
                  handleChange(e);
                  dispatch({
                    type: EventType.PROPOSAL_METADATA_CHANGED,
                    payload: { title: e.target.value },
                  });
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
                onBlur={e => {
                  handleChange(e);
                  dispatch({
                    type: EventType.PROPOSAL_METADATA_CHANGED,
                    payload: { abstract: e.target.value },
                  });
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
            userChanged={(user: BasicUserDetails) => {
              setFieldValue('proposer', user);
              dispatch({
                type: EventType.PROPOSAL_METADATA_CHANGED,
                payload: { proposer: user },
              });
            }}
            title="Principal investigator"
            className={classes.pi}
            userId={values.proposer.id}
          />
          <ProposalParticipants
            error={userError}
            setUsers={(users: BasicUserDetails[]) => {
              setUsers(users);
              dispatch({
                type: EventType.PROPOSAL_METADATA_CHANGED,
                payload: { users: users },
              });
            }}
            // quickfix for material table changing immutable state
            // https://github.com/mbrn/material-table/issues/666
            users={JSON.parse(JSON.stringify(users))}
          />
          <ProposalNavigationFragment
            disabled={props.readonly}
            saveAndNext={{ callback: submitForm, isBusy: isSubmitting }}
            isLoading={false}
          />
        </Form>
      )}
    </Formik>
  );
}
