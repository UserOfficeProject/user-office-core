import { Button, Typography } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import React, { useContext } from 'react';
import * as Yup from 'yup';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import TextField from 'components/common/FormikUITextField';
import { FeatureContext } from 'context/FeatureContextProvider';
import { FeatureId } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

interface AcceptInviteProps {
  title?: string;
  onAccepted?: () => void;
  onClose?: () => void;
}

function AcceptInvite(props: AcceptInviteProps) {
  const { api } = useDataApiWithFeedback();
  const { featuresMap } = useContext(FeatureContext);

  const [successfullyAccepted, setSuccessfullyAccepted] = React.useState(false);

  const isLegacyFlow = featuresMap.get(
    FeatureId.EMAIL_INVITE_LEGACY
  )?.isEnabled;

  return (
    <Formik
      initialValues={{
        code: '',
      }}
      onSubmit={async (values): Promise<void> => {
        if (isLegacyFlow) {
          api({ toastSuccessMessage: 'Code verification successful' })
            .redeemCode({ code: values.code })
            .then(() => {
              setSuccessfullyAccepted(true);
              props.onAccepted?.();
              props.onClose?.();
            });
        } else {
          api({ toastSuccessMessage: 'Code verification successful' })
            .acceptInvite({ code: values.code })
            .then(() => {
              setSuccessfullyAccepted(true);
              props.onAccepted?.();
              props.onClose?.();
            });
        }
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
            label={isLegacyFlow ? 'Redeem code' : 'Invite code'}
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
              {isLegacyFlow ? 'Redeem' : 'Accept'}
            </Button>
          </ActionButtonContainer>
        </Form>
      )}
    </Formik>
  );
}

export default AcceptInvite;
