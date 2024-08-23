import { Button, Typography } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import TextField from 'components/common/FormikUITextField';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

interface RedeemCodeProps {
  title?: string;
  onRedeemed?: () => void;
  onClose?: () => void;
}

function RedeemCode(props: RedeemCodeProps) {
  const { api } = useDataApiWithFeedback();

  const [successfullyRedeemed, setSuccessfullyRedeemed] = React.useState(false);

  return (
    <Formik
      initialValues={{
        code: '',
      }}
      onSubmit={async (values): Promise<void> => {
        api({ toastSuccessMessage: 'Code verification successful' })
          .redeemCode({ code: values.code })
          .then(() => {
            setSuccessfullyRedeemed(true);
            props.onRedeemed?.();
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
            label="Redeem code"
            type="text"
            component={TextField}
            fullWidth
            data-cy="code"
            disabled={successfullyRedeemed}
          />

          <ActionButtonContainer>
            <Button
              type="submit"
              data-cy="invitation-submit"
              disabled={successfullyRedeemed}
            >
              Redeem
            </Button>
          </ActionButtonContainer>
        </Form>
      )}
    </Formik>
  );
}

export default RedeemCode;
