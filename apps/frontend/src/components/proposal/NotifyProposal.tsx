import { DialogContent, DialogContentText } from '@mui/material';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Field, Form, Formik } from 'formik';
import React from 'react';

import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';

type NotifyProposalProps = {
  close: () => void;
  ignoreNotifiedFlag: (notify: boolean) => void;
};

const NotifyProposal = ({
  close,
  ignoreNotifiedFlag: notifyProposals,
}: NotifyProposalProps) => {
  return (
    <Container component="main" maxWidth="sm">
      <Formik
        initialValues={{
          ignoreNotifiedFlag: false,
        }}
        onSubmit={async (values): Promise<void> => {
          await notifyProposals(values.ignoreNotifiedFlag);
          close();
        }}
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
              Notify results
            </Typography>
            <DialogContent dividers>
              <DialogContentText>
                This action will trigger emails to be sent to principal
                investigators
              </DialogContentText>
            </DialogContent>

            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Field
                  id="ignoreNotifiedFlag"
                  name="ignoreNotifiedFlag"
                  component={CheckboxWithLabel}
                  type="checkbox"
                  Label={{
                    label:
                      'Force notification (send email even if already notified)',
                  }}
                  data-cy="setNotifiedflag"
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
              data-cy="submit-proposal-notify"
            >
              Notify
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default NotifyProposal;
