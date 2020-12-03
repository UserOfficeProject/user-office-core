import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import * as yup from 'yup';

import FormikDropdown from 'components/common/FormikDropdown';

const addNewWorkflowConnectionsRowValidationSchema = yup.object().shape({
  selectedParentDroppableId: yup
    .string()
    .required('You must select parent droppable group id'),
  numberOfColumns: yup.string().required('You must enter number of columns'),
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

type AddNewWorkflowConnectionsRowProps = {
  close: () => void;
  addNewWorkflowConnectionsRow: (
    numberOfColumns: number,
    parentDroppableId: string
  ) => void;
  parentDroppableIds: string[];
};

const AddNewWorkflowConnectionsRow: React.FC<AddNewWorkflowConnectionsRowProps> = ({
  close,
  addNewWorkflowConnectionsRow,
  parentDroppableIds,
}) => {
  const classes = useStyles();

  const initialValues: {
    selectedParentDroppableId: string;
    numberOfColumns: number | '';
  } = {
    selectedParentDroppableId: '',
    numberOfColumns: '',
  };

  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={initialValues}
        onSubmit={async (values): Promise<void> => {
          addNewWorkflowConnectionsRow(
            values.numberOfColumns as number,
            values.selectedParentDroppableId
          );
          close();
        }}
        validationSchema={addNewWorkflowConnectionsRowValidationSchema}
      >
        {({ isSubmitting }): JSX.Element => (
          <Form>
            <Typography className={classes.cardHeader}>
              New workflow connection row
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikDropdown
                  name="selectedParentDroppableId"
                  label="Select parent droppable group"
                  items={parentDroppableIds.map(parentDroppableId => ({
                    value: parentDroppableId,
                    text: parentDroppableId,
                  }))}
                  required
                />
                <FormikDropdown
                  name="numberOfColumns"
                  label="Select number of columns"
                  items={[2, 3, 4].map(numberOfColumn => ({
                    value: numberOfColumn,
                    text: numberOfColumn.toString(),
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
              Add row
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

AddNewWorkflowConnectionsRow.propTypes = {
  close: PropTypes.func.isRequired,
  addNewWorkflowConnectionsRow: PropTypes.func.isRequired,
  parentDroppableIds: PropTypes.array.isRequired,
};

export default AddNewWorkflowConnectionsRow;
