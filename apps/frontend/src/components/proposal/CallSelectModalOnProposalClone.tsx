import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Form, Formik, Field } from 'formik';
import React, { useState, useEffect, ChangeEvent } from 'react';
import * as yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import { Call } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';

const callSelectModalOnProposalsCloneValidationSchema = yup.object().shape({
  selectedCallId: yup.number().required('You must select active call'),
});

type CallSelectModalOnProposalsCloneProps = {
  close: () => void;
  cloneProposalsToCall: (call: Call) => Promise<void>;
};

const CallSelectModalOnProposalsClone = ({
  close,
  cloneProposalsToCall,
}: CallSelectModalOnProposalsCloneProps) => {
  const [showAllCalls, setShowAllCalls] = useState(false);
  const callsData = useCallsData();
  useEffect(() => {
    callsData.setCallsFilter(
      showAllCalls
        ? {}
        : {
            isActive: true,
            isActiveInternal: true,
            isEnded: false,
          }
    );
  }, [showAllCalls]);

  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={{
          selectedCallId: null,
          showAllCalls: false,
          callData: callsData,
        }}
        onSubmit={async (values, actions): Promise<void> => {
          const selectedCall = callsData.calls.find(
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
        {({ isSubmitting, values, handleChange }): JSX.Element => (
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
                  items={callsData.calls.map((call) => ({
                    value: call.id,
                    text: call.shortCode,
                  }))}
                  loading={callsData.loadingCalls}
                  required
                  data-cy="call-selection"
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

            <Field
              name="showAllCalls"
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: `Show all calls ${values.showAllCalls}`,
              }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleChange(e);
                setShowAllCalls(e.target.checked);
              }}
            />
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default CallSelectModalOnProposalsClone;
