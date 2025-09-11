import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Field, Form, Formik } from 'formik';
import React from 'react';

import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';

type NotifyProposalProps = {
  close: () => void;
  notifyProposals: (notify: boolean) => void;
};

const NotifyProposal = ({ close, notifyProposals }: NotifyProposalProps) => {
  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={{
          setNotifiedFlag: false,
        }}
        onSubmit={async (values): Promise<void> => {
          await notifyProposals(values.setNotifiedFlag);
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
              Notify selected proposals
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Field
                  id="setNotifiedFlag"
                  name="setNotifiedFlag"
                  component={CheckboxWithLabel}
                  type="checkbox"
                  Label={{
                    label: 'Set notified flag',
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
