import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Field, Form, Formik } from 'formik';
import { Select } from 'formik-mui';
import PropTypes from 'prop-types';
import React from 'react';
import * as yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';

const addNewWorkflowConnectionsRowValidationSchema = yup.object().shape({
  selectedParentDroppableId: yup
    .string()
    .required('You must select parent droppable group id'),
  numberOfColumns: yup.string().required('You must enter number of columns'),
});

const useStyles = makeStyles((theme) => ({
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

const AddNewWorkflowConnectionsRow: React.FC<
  AddNewWorkflowConnectionsRowProps
> = ({ close, addNewWorkflowConnectionsRow, parentDroppableIds }) => {
  const classes = useStyles();

  const initialValues: {
    selectedParentDroppableId?: string;
    numberOfColumns?: number;
  } = {
    selectedParentDroppableId: undefined,
    numberOfColumns: undefined,
  };

  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={initialValues}
        onSubmit={async (values): Promise<void> => {
          if (values.selectedParentDroppableId) {
            addNewWorkflowConnectionsRow(
              values.numberOfColumns as number,
              values.selectedParentDroppableId
            );
            close();
          }
        }}
        validationSchema={addNewWorkflowConnectionsRowValidationSchema}
      >
        {({ isSubmitting, values }): JSX.Element => (
          <Form>
            <Typography className={classes.cardHeader}>
              New workflow connection row
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikUIAutocomplete
                  name="selectedParentDroppableId"
                  label="Select parent droppable group"
                  items={parentDroppableIds.map((parentDroppableId, index) => ({
                    value: parentDroppableId,
                    text: index
                      ? `Workflow droppable group ${
                          parentDroppableId.split('_')[1]
                        }`
                      : 'Default droppable group',
                  }))}
                  required
                  data-cy="selectParentDroppableGroup"
                />
                <FormControl fullWidth>
                  <InputLabel
                    htmlFor="numberOfColumns"
                    shrink={!!values.numberOfColumns}
                  >
                    Select number of columns
                  </InputLabel>
                  <Field
                    id="numberOfColumns"
                    name="numberOfColumns"
                    type="text"
                    component={Select}
                    data-cy="numberOfColumns"
                    required
                    MenuProps={{ 'data-cy': 'numberOfColumnsOptions' }}
                  >
                    {[2, 3, 4].map((numberOfColumn) => {
                      return (
                        <MenuItem value={numberOfColumn} key={numberOfColumn}>
                          {numberOfColumn}
                        </MenuItem>
                      );
                    })}
                  </Field>
                </FormControl>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
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
