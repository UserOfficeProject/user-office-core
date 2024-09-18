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
import { InstrumentFragment, ProposalViewTechnique } from 'generated/sdk';
import { getUniqueArray } from 'utils/helperFunctions';

import { useInstrumentsByTechnique } from './useInstrumentsByTechnique';

type AssignProposalsToInstrumentsProps = {
  close: () => void;
  assignProposalsToInstruments: (
    instrument: InstrumentFragment[] | null
  ) => Promise<void>;
  techniques: (ProposalViewTechnique | null)[];
  instrumentIds: (number | null)[];
};

const AssignProposalsToInstruments = ({
  close,
  assignProposalsToInstruments,
  techniques,
  instrumentIds,
}: AssignProposalsToInstrumentsProps) => {
  const { t } = useTranslation();

  const techniqueIds = techniques
    .filter((technique) => technique != null)
    .map((technique) => technique.id);

  const { instruments, loadingInstruments } =
    useInstrumentsByTechnique(techniqueIds);

  const uniqueInstrumentIds = getUniqueArray(instrumentIds);

  return (
    <Container
      component="main"
      maxWidth="xs"
      data-cy="proposals-instrument-assignment"
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

          await assignProposalsToInstruments(selectedInstruments || null);
          close();
        }}
      >
        {({ isSubmitting, values }): JSX.Element => (
          <Form>
            <Typography variant="h6" component="h1">
              {`Assign proposal/s to ${i18n.format(
                t('instrument'),
                'lowercase'
              )}`}
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
                  noOptionsText={
                    'No ' +
                    i18n.format(
                      i18n.format(t('instrument'), 'plural'),
                      'lowercase'
                    )
                  }
                  data-cy="instrument-selection"
                />
              </Grid>
            </Grid>
            {!values.selectedInstrumentIds.length && (
              <Alert severity="warning" data-cy="remove-instrument-alert">
                {`Be aware that leaving ${i18n.format(
                  t('instrument'),
                  'lowercase'
                )} selection empty will remove
                assigned instrument from proposal/s.`}
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

// NOTE: This comparison is done to prevent component re-rendering on modal close
export default React.memo(
  AssignProposalsToInstruments,
  (prevProps, nextProps) =>
    JSON.stringify(prevProps.techniques) ===
    JSON.stringify(nextProps.techniques)
);
