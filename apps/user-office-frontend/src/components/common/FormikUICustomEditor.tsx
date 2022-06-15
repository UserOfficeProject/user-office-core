import makeStyles from '@mui/styles/makeStyles';
import { Editor } from '@tinymce/tinymce-react';
import { FormikHelpers, FormikValues } from 'formik';
import React, { useState } from 'react';

import { FunctionType } from 'utils/utilTypes';

const useStyles = makeStyles((theme) => ({
  label: {
    marginTop: '17px',
    fontSize: '1.1875em',
    display: 'block',
    color: theme.palette.grey[800],
  },
}));

/* NOTE: We prefer using Editor component directly into the forms (example: ProposalTechnicalReview component) instead of FormikUICustomEditor with Formik Field component.
  This is because FormikUICustomEditor is not updated properly when we set form field onEditorChange
  (it returns the cursor at the beginning on every keypress because we are updating the form field).
  It works when we use onBlur event to update the form field but it is problematic to test that with Cypress,
  because for some reason it is not firing the onBlur event and form is not updated when we try to submit or save.
*/
const FormikUICustomEditor = ({
  field,
  form,
  ...props
}: {
  field: {
    name: string;
    onBlur: FunctionType;
    onChange: FunctionType;
    value: string;
  };
  form: FormikHelpers<FormikValues>;
  'data-cy'?: string;
  label?: string;
}) => {
  const classes = useStyles();
  const [fieldValue, setFieldValue] = useState(field.value);

  return (
    <div data-cy={props['data-cy']}>
      {props.label && <label className={classes.label}>{props.label}</label>}
      <Editor
        initialValue={field.value}
        {...props}
        onEditorChange={(content) => setFieldValue(content)}
        onBlur={() => form.setFieldValue(field.name, fieldValue)}
      />
    </div>
  );
};

export default FormikUICustomEditor;
