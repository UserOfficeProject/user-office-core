import { Field } from 'formik';
import { TextField } from 'formik-material-ui';

export const QuestionDrawer = () => {
  return (
    <div>
      <Field
        name="filterText"
        label="filterText"
        type="text"
        component={TextField}
        margin="normal"
        fullWidth
        inputProps={{ 'data-cy': 'filterText' }}
      />
    </div>
  );
};
