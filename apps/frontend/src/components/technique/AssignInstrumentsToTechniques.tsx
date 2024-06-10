import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Form, Formik } from 'formik';
import React from 'react';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import { InstrumentFragment } from 'generated/sdk';
import { useInstruments } from 'hooks/instrument/useInstruments';
import { getUniqueArray } from 'utils/helperFunctions';

type AssignInstrumentsToTechniquesProps = {
  close: () => void;
  assignInstrumentsToTechniques: (
    instrument: InstrumentFragment[]
  ) => Promise<void>;
  removeIntrumentsFromTechnique: (id: number[]) => Promise<void>;
  instrumentIds: (number | null)[];
};

const AssignInstrumentsToTechniques = ({
  close,
  assignInstrumentsToTechniques,
  removeIntrumentsFromTechnique,
  instrumentIds,
}: AssignInstrumentsToTechniquesProps) => {
  const { instruments, loadingInstruments } = useInstruments();

  const uniqueInstrumentIds = getUniqueArray(instrumentIds);

  return (
    <Container
      component="main"
      maxWidth="xs"
      data-cy="technique-instruments-assignment"
    >
      <Formik
        initialValues={{
          selectedInstrumentIds: uniqueInstrumentIds || null,
        }}
        onSubmit={async (values): Promise<void> => {
          const selectedInstruments = instruments.filter((instrument) =>
            values.selectedInstrumentIds.find(
              (selectedInstrumentId) => selectedInstrumentId === instrument.id
            )
          );

          if (instrumentIds.length != 0) {
            const addedInstruments = selectedInstruments.filter(
              (instrument) =>
                !instrumentIds.find(
                  (selectedInstrumentId) =>
                    selectedInstrumentId === instrument.id
                )
            );
            const deletedInstruments: number[] = [];

            instrumentIds.forEach((id) => {
              if (
                id != null &&
                !selectedInstruments.find(
                  (selectedInstrumentId) => selectedInstrumentId.id === id
                )
              ) {
                deletedInstruments.push(id);
              }
            });

            await assignInstrumentsToTechniques(addedInstruments || null);

            await removeIntrumentsFromTechnique(deletedInstruments);
          } else {
            await assignInstrumentsToTechniques(selectedInstruments || null);
          }

          close();
        }}
      >
        {({ isSubmitting, values }): JSX.Element => (
          <Form>
            <Typography variant="h6" component="h1">
              {`Assign technique/s to instrument`}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikUIAutocomplete
                  name="selectedInstrumentIds"
                  label="Select instruments"
                  loading={loadingInstruments}
                  multiple={true}
                  items={instruments.map((instrument) => ({
                    value: instrument.id,
                    text: instrument.name,
                  }))}
                  disabled={isSubmitting}
                  noOptionsText={'No Instruments'}
                  data-cy="instrument-selection"
                />
              </Grid>
            </Grid>
            {!values.selectedInstrumentIds.length && (
              <Alert severity="warning" data-cy="remove-instrument-alert">
                {`Be aware that leaving instrument selection empty will remove
                assigned instrument from technique.`}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              sx={{
                marginTop: (theme) => theme.spacing(3),
              }}
              disabled={isSubmitting || loadingInstruments}
              data-cy="submit-assign-remove-instrument"
            >
              Save
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default React.memo(AssignInstrumentsToTechniques);
