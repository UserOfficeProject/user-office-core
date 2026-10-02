import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Form, Formik } from 'formik';
import React, { useState } from 'react';
import * as yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import { Call } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';

const callSelectModalOnProposalsCloneValidationSchema = yup.object().shape({
  selectedCallId: yup.number().required('You must select a call'),
});

type CallSelectModalOnProposalsCloneProps = {
  close: () => void;
  cloneProposalsToCall: (call: Call) => Promise<void>;
};

// 1. Extract the form and data fetching into an inner component
const CallSelectForm = ({
  close,
  cloneProposalsToCall,
  showAllCalls,
  setShowAllCalls,
}: CallSelectModalOnProposalsCloneProps & {
  showAllCalls: boolean;
  setShowAllCalls: (val: boolean) => void;
}) => {
  const callFilters = showAllCalls
    ? {}
    : {
        isActive: true,
        isActiveInternal: true,
        isEnded: false,
      };

  const { calls, loadingCalls } = useCallsData(callFilters);

  return (
    <Formik
      initialValues={{
        selectedCallId: null,
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
            sx={{
              fontSize: '18px',
              padding: '22px 0 0',
            }}
          >
            Clone proposal/s to call. You will need to review the proposal
            before it is submitted.
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
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showAllCalls}
                    onChange={(e) => setShowAllCalls(e.target.checked)}
                    color="primary"
                    data-cy="show-all-calls-checkbox"
                  />
                }
                label="Show all calls"
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            sx={(theme) => ({
              margin: theme.spacing(3, 0, 2),
            })}
            disabled={isSubmitting}
            data-cy="submit"
          >
            Clone to call
          </Button>
        </Form>
      )}
    </Formik>
  );
};

// 2. The main parent component
const CallSelectModalOnProposalsClone = (
  props: CallSelectModalOnProposalsCloneProps
) => {
  const [showAllCalls, setShowAllCalls] = useState(false);

  return (
    <Container component="main" maxWidth="xs">
      {/* 
        3. By dynamically changing the 'key' prop based on the state, 
        React destroys and re-creates CallSelectForm from scratch whenever the checkbox is clicked. 
        This guarantees the custom hook fires its initial fetch again.
      */}
      <CallSelectForm
        key={showAllCalls ? 'show-all' : 'show-active'}
        {...props}
        showAllCalls={showAllCalls}
        setShowAllCalls={setShowAllCalls}
      />
    </Container>
  );
};

export default CallSelectModalOnProposalsClone;
