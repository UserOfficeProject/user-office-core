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

const callSelectModalOnProposalCloneValidationSchema = yup.object().shape({
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

type CallSelectModalOnProposalCloneProps = {
  close: () => void;
  cloneProposalToCall: (call: Call) => Promise<void>;
};

const CallSelectModalOnProposalClone: React.FC<CallSelectModalOnProposalCloneProps> = ({
  close,
  cloneProposalToCall,
}) => {
  const classes = useStyles();
  const { calls } = useCallsData({ isActive: true });

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

          await cloneProposalToCall(selectedCall);
          close();
        }}
        validationSchema={callSelectModalOnProposalCloneValidationSchema}
      >
        {({ isSubmitting }): JSX.Element => (
          <Form>
            <Typography className={classes.cardHeader}>
              Clone proposal to call
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

CallSelectModalOnProposalClone.propTypes = {
  close: PropTypes.func.isRequired,
  cloneProposalToCall: PropTypes.func.isRequired,
};

export default CallSelectModalOnProposalClone;
