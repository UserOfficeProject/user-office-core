import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import { Form, Formik } from 'formik';
import React, { useContext, useMemo } from 'react';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import { FapInstrument, FapInstrumentInput, UserRole } from 'generated/sdk';
import { useFapsData } from 'hooks/fap/useFapsData';
import { useInstrumentsByIdsData } from 'hooks/instrument/useInstrumentsByIdsData';
import { getUniqueArray } from 'utils/helperFunctions';

type AssignProposalToFapsProps = {
  close: () => void;
  assignProposalsToFaps: (
    fapInstruments: FapInstrumentInput[]
  ) => Promise<void>;
  proposalInstrumentIds: (number | null)[];
  proposalFapInstruments?: (FapInstrument | null)[];
};

const AssignProposalsToFaps = ({
  close,
  assignProposalsToFaps,
  proposalInstrumentIds,
  proposalFapInstruments,
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

  const allSelectedProposalsHaveSameInstruments = proposalInstrumentIds.every(
    (instrumentId) => instrumentId === proposalInstrumentIds[0]
  );

  const initialValues: Record<string, number | undefined | null> = {};

  proposalFapInstruments?.forEach((fapInstrument) => {
    if (fapInstrument) {
      initialValues[`selectedFapIds_${fapInstrument.instrumentId}`] =
        fapInstrument.fapId || null;
    }
  });

  const hasEmptyValue = (values: Record<string, number | undefined | null>) =>
    Object.values(values).every((v) => v !== undefined && v !== null);

  return (
    <Container
      component="main"
      maxWidth="xs"
      data-cy="proposals-fap-assignment"
    >
      <Formik
        initialValues={{ ...initialValues }}
        onSubmit={async (values): Promise<void> => {
          const fapInstruments: FapInstrumentInput[] =
            instruments?.map((instrument) => ({
              instrumentId: instrument.id,
              fapId: values[`selectedFapIds_${instrument.id}`] || null,
            })) || [];

          await assignProposalsToFaps(fapInstruments);
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
                {!isSubmitting && (loadingFaps || loadingInstruments) ? (
                  <UOLoader sx={{ marginLeft: '50%', marginTop: '10px' }} />
                ) : (
                  instruments?.map((instrument) => (
                    <FormikUIAutocomplete
                      key={instrument.id}
                      name={`selectedFapIds_${instrument.id}`}
                      label="Select FAP"
                      items={faps.map((fap) => ({
                        value: fap.id,
                        text: fap.code,
                      }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {instrument?.name}:
                          </InputAdornment>
                        ),
                      }}
                      disabled={isSubmitting}
                      noOptionsText="No FAPs"
                      data-cy="fap-selection"
                    />
                  ))
                )}
              </Grid>
            </Grid>
            {!hasEmptyValue(values) && (
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
