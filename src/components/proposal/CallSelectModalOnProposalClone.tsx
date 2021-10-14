import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import * as yup from 'yup';

import FormikDropdown from 'components/common/FormikDropdown';
import { Call } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';

const callSelectModalOnProposalsCloneValidationSchema = yup.object().shape({
  selectedCallId: yup.string().required('You must select active call'),
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
};

const CallSelectModalOnProposalsClone: React.FC<CallSelectModalOnProposalsCloneProps> =
  ({ close, cloneProposalsToCall }) => {
    const classes = useStyles();
    const { calls, loadingCalls } = useCallsData({ isActive: true });

    return (
      <Container component="main" maxWidth="xs">
        <Formik
          initialValues={{
            selectedCallId: '',
          }}
          onSubmit={async (values, actions): Promise<void> => {
            const selectedCall = calls.find(
              (call) => call.id === +values.selectedCallId
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
                  <FormikDropdown
                    name="selectedCallId"
                    label="Select call"
                    items={calls.map((call) => ({
                      value: call.id.toString(),
                      text: call.shortCode,
                    }))}
                    loading={loadingCalls}
                    required
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
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
