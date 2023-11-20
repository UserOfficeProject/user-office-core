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
import { UserRole, Fap } from 'generated/sdk';
import { useFapsData } from 'hooks/fap/useFapsData';

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
  const classes = useStyles();
  const { t } = useTranslation();
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
          <Form className={classes.form}>
            <Typography
              variant="h6"
              component="h1"
              className={classes.cardHeader}
            >
              {`Assign proposal/s to ${t('Fap')}`}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikUIAutocomplete
                  name="selectedFapId"
                  label={`Select ${t('Fap')}`}
                  loading={loadingFaps}
                  items={Faps.map((fap) => ({
                    value: fap.id,
                    text: fap.code,
                  }))}
                  disabled={isSubmitting}
                  noOptionsText={`No ${i18n.format(t('Fap'), 'plural')}`}
                  data-cy="fap-selection"
                />
              </Grid>
            </Grid>
            {!values.selectedFapId && (
              <Alert severity="warning" data-cy="remove-fap-alert">
                {`Be aware that leaving ${t(
                  'Fap'
                )} selection empty will remove assigned
                ${t('Fap')} from proposal/s and delete all ${t(
                  'Fap'
                )} reviews on that
                assignment.`}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              className={classes.submit}
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
