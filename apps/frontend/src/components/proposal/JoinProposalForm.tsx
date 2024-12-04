import { Button, Typography } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import TextField from 'components/common/FormikUITextField';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

interface JoinProposalFormProps {
  title?: string;
  onProposalJoined?: () => void;
  onFormClose?: () => void;
}

function JoinProposalForm(props: JoinProposalFormProps) {
  const { api } = useDataApiWithFeedback();

  const [isJoined, setIsJoined] = React.useState(false);

  return (
    <Formik
      initialValues={{
        inviteCode: '',
      }}
      onSubmit={async (values): Promise<void> => {
        api({ toastSuccessMessage: 'Code verification successful' })
          .verifyAndJoinProposal({ code: values.inviteCode })
          .then(() => {
            setIsJoined(true);
            props.onProposalJoined?.();
            props.onFormClose?.();
          });
      }}
      validationSchema={Yup.object().shape({
        inviteCode: Yup.string().required('Invitation code is required'),
      })}
    >
      {() => (
        <Form>
          <Typography variant="h6" component="h2">
            {props.title}
          </Typography>
          <Field
            id="inviteCode"
            name="inviteCode"
            label="Invitation Code"
            type="text"
            component={TextField}
            fullWidth
            data-cy="invite-code"
            disabled={isJoined}
          />

          <ActionButtonContainer>
            <Button
              type="submit"
              data-cy="invitation-submit"
              disabled={isJoined}
            >
              Join Proposal
            </Button>
          </ActionButtonContainer>
        </Form>
      )}
    </Formik>
  );
}

export default JoinProposalForm;
