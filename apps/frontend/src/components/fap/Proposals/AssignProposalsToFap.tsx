import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Form, Formik } from 'formik';
import React, { useContext, useMemo } from 'react';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import { UserContext } from 'context/UserContextProvider';
import { UserRole, Fap, GetInstrumentsByIdsQuery } from 'generated/sdk';
import { useFapsData } from 'hooks/fap/useFapsData';
import { useInstrumentsByIdsData } from 'hooks/instrument/useInstrumentsByIdsData';
import { getUniqueArray } from 'utils/helperFunctions';

type AssignProposalToFapProps = {
  close: () => void;
  assignProposalsToFap: (
    fap: Fap | null,
    fapInstrument:
      | NonNullable<GetInstrumentsByIdsQuery['instrumentsByIds']>[0]
      | null
  ) => Promise<void>;
  fapIds: (number | null)[];
  proposalInstrumentIds: (number | null)[];
  proposalFapInstrumentIds: (number | null)[];
};

const AssignProposalsToFap = ({
  close,
  assignProposalsToFap,
  fapIds,
  proposalInstrumentIds,
  proposalFapInstrumentIds,
}: AssignProposalToFapProps) => {
  const { currentRole } = useContext(UserContext);
  const { faps, loadingFaps } = useFapsData({
    filter: '',
    active: true,
    role: currentRole as UserRole,
  });
  const uniqueInstrumentIds = useMemo(
    () => getUniqueArray(proposalInstrumentIds),
    [proposalInstrumentIds]
  );
  const { instruments, loadingInstruments } =
    useInstrumentsByIdsData(uniqueInstrumentIds);

  const allSelectedProposalsHaveSameFap = fapIds.every(
    (item) => item === fapIds[0]
  );

  const selectedProposalsFap =
    allSelectedProposalsHaveSameFap && fapIds[0] ? fapIds[0] : null;

  const selectedFapInstrumentId = allSelectedProposalsHaveSameFap
    ? proposalFapInstrumentIds[0]
    : null;

  return (
    <Container
      component="main"
      maxWidth="xs"
      data-cy="proposals-fap-assignment"
    >
      <Formik
        initialValues={{
          selectedFapId: selectedProposalsFap,
          selectedFapInstrumentId: selectedFapInstrumentId,
        }}
        onSubmit={async (values): Promise<void> => {
          const selectedFap =
            faps.find((fap) => fap.id === values.selectedFapId) || null;
          const selectedFapInstrument =
            instruments?.find(
              (instrument) => instrument.id === values.selectedFapInstrumentId
            ) || null;

          await assignProposalsToFap(selectedFap, selectedFapInstrument);
          close();
        }}
      >
        {({ isSubmitting, values }): JSX.Element => (
          <Form>
            <Typography variant="h6" component="h1">
              Assign proposal/s to FAP
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikUIAutocomplete
                  name="selectedFapId"
                  label="Select FAP"
                  loading={loadingFaps}
                  items={faps.map((fap) => ({
                    value: fap.id,
                    text: fap.code,
                  }))}
                  disabled={isSubmitting}
                  noOptionsText="No FAPs"
                  data-cy="fap-selection"
                />
                {values.selectedFapId && (
                  <FormikUIAutocomplete
                    name="selectedFapInstrumentId"
                    label="Select FAP instrument"
                    loading={loadingInstruments}
                    items={
                      instruments?.map((instrument) => ({
                        value: instrument.id,
                        text: instrument.name,
                      })) || []
                    }
                    disabled={isSubmitting}
                    noOptionsText="No instruments"
                    data-cy="fap-instrument-selection"
                    required={!!values.selectedFapId}
                  />
                )}
              </Grid>
            </Grid>
            {!values.selectedFapId && (
              <Alert severity="warning" data-cy="remove-fap-alert">
                Be aware that leaving FAP selection empty will remove assigned
                FAP from proposal/s and delete all FAP reviews on that
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
