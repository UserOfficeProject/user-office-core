import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { createSEPValidationSchema } from '@user-office-software/duo-validation/lib/SEP';
import { Field, Form, Formik } from 'formik';
import { Checkbox, TextField } from 'formik-mui';
import PropTypes from 'prop-types';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { Sep } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles((theme) => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type AddSEPProps = {
  close: (sepAdded: Sep | null) => void;
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
        const data = await api({
          toastSuccessMessage: 'SEP created successfully!',
        }).createSEP(values);

        if (data.createSEP.rejection) {
          close(null);
        } else {
          close(data.createSEP.sep);
        }
      }}
      validationSchema={createSEPValidationSchema}
    >
      {(): JSX.Element => (
        <Form>
          <Typography variant="h6" component="h1">
            Create new SEP
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
                data-cy="sepActive"
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

AddSEP.propTypes = {
  close: PropTypes.func.isRequired,
};

export default AddSEP;
