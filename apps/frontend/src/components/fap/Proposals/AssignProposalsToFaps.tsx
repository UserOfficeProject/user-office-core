import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Form, Formik } from 'formik';
import React, { useContext, useMemo } from 'react';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import { UserContext } from 'context/UserContextProvider';
import {
  UserRole,
  // Fap,
  // GetInstrumentsByIdsQuery,
  // Instrument,
} from 'generated/sdk';
import { useFapsData } from 'hooks/fap/useFapsData';
import { useInstrumentsByIdsData } from 'hooks/instrument/useInstrumentsByIdsData';
import { getUniqueArray } from 'utils/helperFunctions';

type AssignProposalToFapsProps = {
  close: () => void;
  assignProposalsToFaps: (
    faps: number[] | null,
    fapInstruments: number[] | null
  ) => Promise<void>;
  fapIds: (number[] | null)[];
  proposalInstrumentIds: (number | null)[];
  proposalFapInstrumentIds: (number | null)[];
};

const AssignProposalsToFaps = ({
  close,
  assignProposalsToFaps,
  fapIds,
  proposalInstrumentIds,
  proposalFapInstrumentIds,
}: AssignProposalToFapsProps) => {
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

  // TODO: Add this array comparison into a helper function and/or make it nicer
  const allSelectedProposalsHaveSameFap = fapIds.every(
    (item) =>
      item?.sort((a, b) => (a && b ? a - b : 0)).toString() ===
      fapIds[0]?.sort((a, b) => (a && b ? a - b : 0)).toString()
  );

  const selectedProposalsFaps =
    allSelectedProposalsHaveSameFap && fapIds[0] ? fapIds[0] : [];

  const selectedFapInstrumentIds =
    allSelectedProposalsHaveSameFap && proposalFapInstrumentIds[0]
      ? getUniqueArray(proposalFapInstrumentIds)
      : [];

  return (
    <Container
      component="main"
      maxWidth="xs"
      data-cy="proposals-fap-assignment"
    >
      <Formik
        initialValues={{
          selectedFapIds: selectedProposalsFaps,
          selectedFapInstrumentIds: selectedFapInstrumentIds,
        }}
        onSubmit={async (values): Promise<void> => {
          // const selectedFaps = values.selectedFapIds.map(
          //   (selectedFapId) =>
          //     faps.find((fap) => fap.id === selectedFapId) as Fap
          // );

          // const selectedFapInstruments = values.selectedFapInstrumentIds.map(
          //   (selectedFapInstrumentId) =>
          //     instruments?.find(
          //       (instrument) => instrument.id === selectedFapInstrumentId
          //     ) as Instrument
          // );

          await assignProposalsToFaps(
            values.selectedFapIds,
            values.selectedFapInstrumentIds
          );
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
                  name="selectedFapIds"
                  label="Select FAP"
                  multiple={true}
                  loading={loadingFaps}
                  items={faps.map((fap) => ({
                    value: fap.id,
                    text: fap.code,
                  }))}
                  disabled={isSubmitting}
                  noOptionsText="No FAPs"
                  data-cy="fap-selection"
                />
                {!!values.selectedFapIds?.length && (
                  <FormikUIAutocomplete
                    name="selectedFapInstrumentIds"
                    label="Select FAP instrument"
                    loading={loadingInstruments}
                    multiple={true}
                    items={
                      instruments?.map((instrument) => ({
                        value: instrument.id,
                        text: instrument.name,
                      })) || []
                    }
                    disabled={isSubmitting}
                    noOptionsText="No instruments"
                    data-cy="fap-instrument-selection"
                  />
                )}
              </Grid>
            </Grid>
            {!values.selectedFapIds?.length && (
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

export default AssignProposalsToFaps;
