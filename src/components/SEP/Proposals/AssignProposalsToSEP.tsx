import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';

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

type AssignProposalToSEPProps = {
  close: () => void;
  assignProposalsToSEP: (sep: Sep | null) => Promise<void>;
  sepIds: (number | null)[];
};

const AssignProposalsToSEP: React.FC<AssignProposalToSEPProps> = ({
  close,
  assignProposalsToSEP,
  sepIds,
}) => {
  const classes = useStyles();
  const { currentRole } = useContext(UserContext);
  const { SEPs, loadingSEPs } = useSEPsData('', true, currentRole as UserRole);
  const allSelectedProposalsHaveSameSep = sepIds.every(
    (item) => item === sepIds[0]
  );

  const selectedProposalsSep =
    allSelectedProposalsHaveSameSep && sepIds[0] ? sepIds[0].toString() : '';

  return (
    <Container
      component="main"
      maxWidth="xs"
      data-cy="proposals-sep-assignment"
    >
      <Formik
        initialValues={{
          selectedSEPId: selectedProposalsSep,
        }}
        onSubmit={async (values): Promise<void> => {
          const selectedSEP = SEPs.find(
            (sep) => sep.id === +values.selectedSEPId
          );

          await assignProposalsToSEP(selectedSEP || null);
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
              Assign proposal/s to SEP
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikUIAutocomplete
                  name="selectedSEPId"
                  label="Select SEP"
                  loading={loadingSEPs}
                  items={SEPs.map((sep) => ({
                    value: sep.id,
                    text: sep.code,
                  }))}
                  disabled={isSubmitting}
                  noOptionsText="No SEPs"
                  data-cy="sep-selection"
                />
              </Grid>
            </Grid>
            {!values.selectedSEPId && (
              <Alert severity="warning" data-cy="remove-sep-alert">
                Be aware that leaving SEP selection empty will remove assigned
                SEP from proposal/s and delete all SEP reviews on that
                assignment.
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

AssignProposalsToSEP.propTypes = {
  close: PropTypes.func.isRequired,
  assignProposalsToSEP: PropTypes.func.isRequired,
  sepIds: PropTypes.array.isRequired,
};

export default AssignProposalsToSEP;
