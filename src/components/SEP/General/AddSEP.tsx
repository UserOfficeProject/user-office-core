import { createSEPValidationSchema } from '@esss-swap/duo-validation/lib/SEP';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { Checkbox, TextField } from 'formik-material-ui';
import PropTypes from 'prop-types';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { Sep } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles(theme => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type AddSEPProps = {
  close: (sepAdded: Sep | null | undefined) => void;
};

const AddSEP: React.FC<AddSEPProps> = ({ close }) => {
  const classes = useStyles();
  const { api, isExecutingCall } = useDataApiWithFeedback();

  return (
    <Formik
      initialValues={{
        code: '',
        description: '',
        numberRatingsRequired: 2,
        active: true,
      }}
      onSubmit={async (values): Promise<void> => {
        const data = await api('SEP created successfully!').createSEP(values);

        if (data.createSEP.error) {
          close(null);
        } else {
          close(data.createSEP.sep);
        }
      }}
      validationSchema={createSEPValidationSchema}
    >
      {({
        values,
        errors,
        handleChange,
        touched,
        setFieldValue,
      }): JSX.Element => (
        <Form>
          <Typography variant="h6">Create new SEP</Typography>

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
            disabled={isExecutingCall}
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
            disabled={isExecutingCall}
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
            disabled={isExecutingCall}
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
            disabled={isExecutingCall}
          >
            {isExecutingCall && <UOLoader size={14} />}
            Create
          </Button>
        </Form>
      )}
    </Formik>
  );
};

AddSEP.propTypes = {
  close: PropTypes.func.isRequired,
};

export default AddSEP;
