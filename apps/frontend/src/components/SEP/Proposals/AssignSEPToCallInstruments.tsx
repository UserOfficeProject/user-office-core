import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Form, Formik } from 'formik';
import i18n from 'i18n';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import { UserContext } from 'context/UserContextProvider';
import { UserRole, Sep } from 'generated/sdk';
import { useSEPsData } from 'hooks/SEP/useSEPsData';

const useStyles = makeStyles((theme) => ({
  cardHeader: {
    fontSize: '18px',
    padding: '22px 0 0',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  form: {
    width: '240px',
  },
}));

type AssignSEPtoCallInstrumentsProps = {
  close: () => void;
  assignSEPtoCallInstruments: (sep: Sep | null) => Promise<void>;
  sepIds: (number | null)[];
};

const AssignSEPToCallInstruments = ({
  close,
  assignSEPtoCallInstruments,
  sepIds,
}: AssignSEPtoCallInstrumentsProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { currentRole } = useContext(UserContext);
  const { SEPs, loadingSEPs } = useSEPsData({
    filter: '',
    active: true,
    role: currentRole as UserRole,
  });

  const allSelectedCallInstrumentHaveSameSep = sepIds.every(
    (item) => item === sepIds[0]
  );

  const selectedCallInstrumentsSep =
    allSelectedCallInstrumentHaveSameSep && sepIds[0] ? sepIds[0] : null;

  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={{
          selectedSEPId: selectedCallInstrumentsSep,
        }}
        onSubmit={async (values): Promise<void> => {
          const selectedSEP = SEPs.find(
            (sep) => sep.id === values.selectedSEPId
          );

          await assignSEPtoCallInstruments(selectedSEP || null);
          close();
        }}
      >
        {({ isSubmitting, values }): JSX.Element => (
          <Form className={classes.form}>
            <Typography
              variant="h6"
              component="h1"
              className={classes.cardHeader}
            >
              {`Assign SEP to ${t('Call Instruments')}`}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikUIAutocomplete
                  name="selectedSEPId"
                  label={`Select ${t('SEP')}`}
                  loading={loadingSEPs}
                  items={SEPs.map((sep) => ({
                    value: sep.id,
                    text: sep.code,
                  }))}
                  disabled={isSubmitting}
                  noOptionsText={`No ${i18n.format(t('SEP'), 'plural')}`}
                  data-cy="sep-selection"
                />
              </Grid>
            </Grid>
            {!values.selectedSEPId && (
              <Alert severity="warning" data-cy="remove-sep-alert">
                {`Be aware that leaving ${t(
                  'SEP'
                )} selection empty will remove assigned
                ${t('SEP')} from Call Instruments`}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              className={classes.submit}
              disabled={isSubmitting || loadingSEPs}
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

export default AssignSEPToCallInstruments;
