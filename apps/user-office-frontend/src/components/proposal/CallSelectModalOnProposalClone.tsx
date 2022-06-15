import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import * as yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import { Call } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';

const callSelectModalOnProposalsCloneValidationSchema = yup.object().shape({
  selectedCallId: yup.number().required('You must select active call'),
});

const useStyles = makeStyles((theme) => ({
  cardHeader: {
    fontSize: '18px',
    padding: '22px 0 0',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type CallSelectModalOnProposalsCloneProps = {
  close: () => void;
  cloneProposalsToCall: (call: Call) => Promise<void>;
  templateId?: number;
};

const CallSelectModalOnProposalsClone: React.FC<
  CallSelectModalOnProposalsCloneProps
> = ({ close, cloneProposalsToCall, templateId }) => {
  const classes = useStyles();
  const { calls, loadingCalls } = useCallsData({
    isActive: true,
    templateIds: templateId ? [templateId] : undefined,
  });

  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={{
          selectedCallId: undefined,
        }}
        onSubmit={async (values, actions): Promise<void> => {
          const selectedCall = calls.find(
            (call) => call.id === values.selectedCallId
          );

          if (!selectedCall) {
            actions.setFieldError('selectedCallId', 'Required');

            return;
          }

          await cloneProposalsToCall(selectedCall);
          close();
        }}
        validationSchema={callSelectModalOnProposalsCloneValidationSchema}
      >
        {({ isSubmitting }): JSX.Element => (
          <Form>
            <Typography
              variant="h6"
              component="h1"
              className={classes.cardHeader}
            >
              Clone proposal/s to call
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikUIAutocomplete
                  name="selectedCallId"
                  label="Select call"
                  items={calls.map((call) => ({
                    value: call.id,
                    text: call.shortCode,
                  }))}
                  loading={loadingCalls}
                  required
                  data-cy="call-selection"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              className={classes.submit}
              disabled={isSubmitting}
              data-cy="submit"
            >
              Clone to call
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

CallSelectModalOnProposalsClone.propTypes = {
  close: PropTypes.func.isRequired,
  cloneProposalsToCall: PropTypes.func.isRequired,
};

export default CallSelectModalOnProposalsClone;
