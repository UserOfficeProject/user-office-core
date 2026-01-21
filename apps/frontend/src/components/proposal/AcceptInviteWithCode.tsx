import { Button, Typography } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import TextField from 'components/common/FormikUITextField';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

interface AcceptInviteWithCodeProps {
  title?: string;
  onAccepted?: () => void;
  onClose?: () => void;
}

function AcceptInviteWithCode(props: AcceptInviteWithCodeProps) {
  const { api } = useDataApiWithFeedback();

  const [successfullyAccepted, setSuccessfullyAccepted] = React.useState(false);

  return (
    <Formik
      initialValues={{
        code: '',
      }}
      onSubmit={async (values): Promise<void> => {
        api({ toastSuccessMessage: 'Code verification successful' })
          .acceptInviteWithCode({ code: values.code })
          .then(() => {
            setSuccessfullyAccepted(true);
            props.onAccepted?.();
            props.onClose?.();
          });
      }}
      validationSchema={Yup.object().shape({ code: Yup.string().required() })}
    >
      {() => (
        <Form>
          <Typography variant="h6" component="h2">
            {props.title}
          </Typography>
          <Field
            id="code"
            name="code"
            label={'Invite code'}
            type="text"
            component={TextField}
            fullWidth
            data-cy="code"
            disabled={successfullyAccepted}
          />

          <ActionButtonContainer>
            <Button
              type="submit"
              data-cy="invitation-submit"
              disabled={successfullyAccepted}
            >
              {'Accept'}
            </Button>
          </ActionButtonContainer>
        </Form>
      )}
    </Formik>
  );
}

export default AcceptInviteWithCode;
