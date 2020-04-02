import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { FormControlLabel } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField, Checkbox } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React from 'react';

import { useDataApi } from '../../hooks/useDataApi';
import SEPValidationSchema from './SEPValidationSchema';

const useStyles = makeStyles(theme => ({
  cardHeader: {
    fontSize: '18px',
    padding: '22px 0 0',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type AddSEPProps = {
  close: () => void;
};

const AddSEP: React.FC<AddSEPProps> = ({ close }) => {
  const classes = useStyles();
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={{
          code: '',
          description: '',
          numberRatingsRequired: 2,
          active: true,
        }}
        onSubmit={async (values, actions): Promise<void> => {
          await api()
            .createSEP(values)
            .then(data =>
              data.createSEP.error
                ? enqueueSnackbar(
                    getTranslation(data.createSEP.error as ResourceId),
                    {
                      variant: 'error',
                    }
                  )
                : null
            );
          actions.setSubmitting(false);
          close();
        }}
        validationSchema={SEPValidationSchema}
      >
        {({
          values,
          errors,
          handleChange,
          touched,
          setFieldValue,
        }): JSX.Element => (
          <Form>
            <Typography className={classes.cardHeader}>
              Create new SEP
            </Typography>

            <Field
              name="code"
              id="code"
              label="Code"
              type="text"
              value={values.code}
              onChange={handleChange}
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="code"
              error={touched.code && errors.code !== undefined}
              helperText={touched.code && errors.code && errors.code}
            />
            <Field
              id="description"
              name="description"
              label="Description"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              multiline
              rowsMax="16"
              rows="3"
              onChange={handleChange}
              value={values.description}
              data-cy="description"
              error={touched.description && errors.description !== undefined}
              helperText={
                touched.description && errors.description && errors.description
              }
            />

            <Field
              id="numberRatingsRequired"
              name="numberRatingsRequired"
              label="Number of ratings required"
              type="number"
              component={TextField}
              margin="normal"
              fullWidth
              onChange={handleChange}
              value={values.numberRatingsRequired}
              data-cy="numberRatingsRequired"
              error={
                touched.numberRatingsRequired &&
                errors.numberRatingsRequired !== undefined
              }
              helperText={
                touched.numberRatingsRequired &&
                errors.numberRatingsRequired &&
                errors.numberRatingsRequired
              }
            />
            <FormControlLabel
              control={
                <Field
                  id="active"
                  name="active"
                  type="checkbox"
                  component={Checkbox}
                  value={values.active}
                  color="primary"
                  onChange={(): void => setFieldValue('active', !values.active)}
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                />
              }
              label="Active"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              data-cy="submit"
            >
              Add SEP
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

AddSEP.propTypes = {
  close: PropTypes.func.isRequired,
};

export default AddSEP;
