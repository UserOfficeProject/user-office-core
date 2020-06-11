import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import * as yup from 'yup';

import { useSEPsData } from '../../hooks/useSEPsData';
import FormikDropdown from '../common/FormikDropdown';

const assignProposalToSEPValidationSchema = yup.object().shape({
  selectedSEPId: yup.string().required('You must select active SEP'),
});

const useStyles = makeStyles(theme => ({
  cardHeader: {
    fontSize: '18px',
    padding: '22px 0 0',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type AssignProposalToSEPProps = {
  close: () => void;
  assignProposalToSEP: (sepId: number) => void;
};

const AssignProposalToSEP: React.FC<AssignProposalToSEPProps> = ({
  close,
  assignProposalToSEP,
}) => {
  const classes = useStyles();
  const { SEPsData } = useSEPsData(false, '', true);

  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={{
          selectedSEPId: '',
        }}
        onSubmit={async (values, actions): Promise<void> => {
          actions.setSubmitting(false);
          assignProposalToSEP(+values.selectedSEPId);
          close();
        }}
        validationSchema={assignProposalToSEPValidationSchema}
      >
        {({ isSubmitting }): JSX.Element => (
          <Form>
            <Typography className={classes.cardHeader}>
              Assign proposal/s to SEP
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikDropdown
                  name="selectedSEPId"
                  label="Select SEP"
                  items={SEPsData.map(sep => ({
                    value: sep.id.toString(),
                    text: sep.code,
                  }))}
                  required
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={isSubmitting}
              data-cy="submit"
            >
              Assign to SEP
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

AssignProposalToSEP.propTypes = {
  close: PropTypes.func.isRequired,
  assignProposalToSEP: PropTypes.func.isRequired,
};

export default AssignProposalToSEP;
