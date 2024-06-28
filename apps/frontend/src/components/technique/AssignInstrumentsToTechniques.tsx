import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Form, Formik } from 'formik';
import i18n from 'i18n';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
  currentlyAssignedInstrumentIds: number[];
};

const AssignInstrumentsToTechniques = ({
  close,
  assignInstrumentsToTechniques,
  removeIntrumentsFromTechnique,
  currentlyAssignedInstrumentIds,
}: AssignInstrumentsToTechniquesProps) => {
  const { instruments, loadingInstruments } = useInstruments();

  const uniqueInstrumentIds = getUniqueArray(currentlyAssignedInstrumentIds);

  const { t } = useTranslation();

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

          if (currentlyAssignedInstrumentIds.length != 0) {
            const addedInstruments = selectedInstruments.filter(
              (instrument) =>
                !currentlyAssignedInstrumentIds.find(
                  (selectedInstrumentId) =>
                    selectedInstrumentId === instrument.id
                )
            );

            const deletedInstruments = currentlyAssignedInstrumentIds.filter(
              (id) =>
                !selectedInstruments.find(
                  (selectedInstrumentId) => selectedInstrumentId.id === id
                )
            );

            if (addedInstruments.length != 0) {
              await assignInstrumentsToTechniques(addedInstruments);
            }

            if (deletedInstruments.length != 0) {
              await removeIntrumentsFromTechnique(deletedInstruments);
            }
          } else {
            if (selectedInstruments.length != 0) {
              await assignInstrumentsToTechniques(selectedInstruments);
            }
          }

          close();
        }}
      >
        {({ isSubmitting, values }): JSX.Element => (
          <Form>
            <Typography variant="h6" component="h1">
              {'Assign ' +
                i18n.format(
                  i18n.format(t('instrument'), 'plural'),
                  'lowercase'
                ) +
                ' to ' +
                i18n.format(t('Technique'), 'lowercase')}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikUIAutocomplete
                  name="selectedInstrumentIds"
                  label={
                    'Select ' +
                    i18n.format(
                      i18n.format(t('instrument'), 'plural'),
                      'lowercase'
                    )
                  }
                  loading={loadingInstruments}
                  multiple={true}
                  items={instruments.map((instrument) => ({
                    value: instrument.id,
                    text: instrument.name,
                  }))}
                  disabled={isSubmitting}
                  noOptionsText={'No ' + i18n.format(t('instrument'), 'plural')}
                  data-cy="instrument-selection"
                />
              </Grid>
            </Grid>
            {!values.selectedInstrumentIds.length && (
              <Alert severity="warning" data-cy="remove-instrument-alert">
                {'Be aware that leaving the ' +
                  i18n.format(
                    i18n.format(t('instrument'), 'plural'),
                    'lowercase'
                  ) +
                  ' selection empty will remove any assigned ' +
                  i18n.format(
                    i18n.format(t('instrument'), 'plural'),
                    'lowercase'
                  ) +
                  ' from the ' +
                  i18n.format(t('Technique'), 'lowercase')}
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
