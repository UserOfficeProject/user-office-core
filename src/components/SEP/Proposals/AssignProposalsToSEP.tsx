import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import { Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import FormikDropdown from 'components/common/FormikDropdown';
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
  const [firstSepId] = sepIds;

  return (
    <Container
      component="main"
      maxWidth="xs"
      data-cy="proposals-sep-assignment"
    >
      <Formik
        initialValues={{
          selectedSEPId: firstSepId || 0,
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
            <Typography className={classes.cardHeader}>
              Assign proposal/s to SEP
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikDropdown
                  name="selectedSEPId"
                  label="Select SEP"
                  loading={loadingSEPs}
                  items={SEPs.map((sep) => ({
                    value: sep.id.toString(),
                    text: sep.code,
                  }))}
                  disabled={isSubmitting}
                  isClearable
                  noOptionsText="No SEPs"
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
              variant="contained"
              color="primary"
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
