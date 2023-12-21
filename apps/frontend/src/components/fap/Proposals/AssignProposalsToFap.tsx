import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Form, Formik } from 'formik';
import React, { useContext } from 'react';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import { UserContext } from 'context/UserContextProvider';
import { UserRole, Fap } from 'generated/sdk';
import { useFapsData } from 'hooks/fap/useFapsData';

type AssignProposalToFapProps = {
  close: () => void;
  assignProposalsToFap: (fap: Fap | null) => Promise<void>;
  fapIds: (number | null)[];
};

const AssignProposalsToFap = ({
  close,
  assignProposalsToFap,
  fapIds,
}: AssignProposalToFapProps) => {
  const { currentRole } = useContext(UserContext);
  const { Faps, loadingFaps } = useFapsData({
    filter: '',
    active: true,
    role: currentRole as UserRole,
  });
  const allSelectedProposalsHaveSameFap = fapIds.every(
    (item) => item === fapIds[0]
  );

  const selectedProposalsFap =
    allSelectedProposalsHaveSameFap && fapIds[0] ? fapIds[0] : null;

  return (
    <Container
      component="main"
      maxWidth="xs"
      data-cy="proposals-fap-assignment"
    >
      <Formik
        initialValues={{
          selectedFapId: selectedProposalsFap,
        }}
        onSubmit={async (values): Promise<void> => {
          const selectedFap = Faps.find(
            (fap) => fap.id === values.selectedFapId
          );

          await assignProposalsToFap(selectedFap || null);
          close();
        }}
      >
        {({ isSubmitting, values }): JSX.Element => (
          <Form>
            <Typography variant="h6" component="h1">
              Assign proposal/s to Fap
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikUIAutocomplete
                  name="selectedFapId"
                  label="Select Fap"
                  loading={loadingFaps}
                  items={Faps.map((fap) => ({
                    value: fap.id,
                    text: fap.code,
                  }))}
                  disabled={isSubmitting}
                  noOptionsText="No Faps"
                  data-cy="fap-selection"
                />
              </Grid>
            </Grid>
            {!values.selectedFapId && (
              <Alert severity="warning" data-cy="remove-fap-alert">
                Be aware that leaving Fap selection empty will remove assigned
                Fap from proposal/s and delete all Fap reviews on that
                assignment.
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              sx={{ marginTop: (theme) => theme.spacing(3) }}
              disabled={isSubmitting || loadingFaps}
              data-cy="submit"
            >
              Save
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default AssignProposalsToFap;
