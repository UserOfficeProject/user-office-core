import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { createFapValidationSchema } from '@user-office-software/duo-validation/lib/fap';
import { Field, Form, Formik } from 'formik';
import { Checkbox, TextField } from 'formik-mui';
import PropTypes from 'prop-types';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { Fap } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles((theme) => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type AddFapProps = {
  close: (fapAdded: Fap | null) => void;
};

const AddFap = ({ close }: AddFapProps) => {
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
        try {
          const { createFap } = await api({
            toastSuccessMessage: 'Fap created successfully!',
          }).createFap(values);

          close(createFap);
        } catch (error) {
          close(null);
        }
      }}
      validationSchema={createFapValidationSchema}
    >
      {(): JSX.Element => (
        <Form>
          <Typography variant="h6" component="h1">
            Create new Fap
          </Typography>

          <Field
            name="code"
            id="code"
            label="Code"
            type="text"
            component={TextField}
            fullWidth
            data-cy="code"
            disabled={isExecutingCall}
          />
          <Field
            id="description"
            name="description"
            label="Description"
            type="text"
            component={TextField}
            fullWidth
            multiline
            maxRows="16"
            minRows="3"
            data-cy="description"
            disabled={isExecutingCall}
          />

          <Field
            id="numberRatingsRequired"
            name="numberRatingsRequired"
            label="Number of ratings required"
            type="number"
            component={TextField}
            fullWidth
            data-cy="numberRatingsRequired"
            disabled={isExecutingCall}
          />

          <FormControlLabel
            control={
              <Field
                id="active"
                name="active"
                component={Checkbox}
                type="checkbox"
                inputProps={{ 'aria-label': 'primary checkbox' }}
                data-cy="fapActive"
              />
            }
            label="Active"
          />

          <Button
            type="submit"
            fullWidth
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

AddFap.propTypes = {
  close: PropTypes.func.isRequired,
};

export default AddFap;
