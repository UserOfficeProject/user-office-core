import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import PropTypes from 'prop-types';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { Unit } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles((theme) => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type CreateUnitProps = {
  close: (unitAdded: Unit | null) => void;
  unit: Unit | null;
};

const CreateUnit: React.FC<CreateUnitProps> = ({ close, unit }) => {
  const classes = useStyles();
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const initialValues = unit
    ? unit
    : {
        name: '',
      };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        const data = await api('Unit created successfully').createUnit({
          name: values.name,
        });
        if (data.createUnit.error) {
          close(null);
        } else if (data.createUnit.unit) {
          close(data.createUnit.unit);
        }
      }}
    >
      {() => (
        <Form>
          <Typography variant="h6">Create new unit</Typography>

          <Field
            name="name"
            id="name"
            label="Name"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            data-cy="name"
            disabled={isExecutingCall}
            required
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

CreateUnit.propTypes = {
  unit: PropTypes.any,
  close: PropTypes.func.isRequired,
};

export default CreateUnit;
