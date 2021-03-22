import makeStyles from '@material-ui/core/styles/makeStyles';
import { Editor } from '@tinymce/tinymce-react';
import { FormikHelpers, FormikValues } from 'formik';
import React from 'react';

import { FunctionType } from 'utils/utilTypes';

const useStyles = makeStyles((theme) => ({
  label: {
    marginTop: '17px',
    fontSize: '1.1875em',
    display: 'block',
    color: theme.palette.grey[800],
  },
}));

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
  label?: string;
}) => {
  const classes = useStyles();

  return (
    <>
      {props.label && <label className={classes.label}>{props.label}</label>}
      <Editor
        initialValue={field.value}
        {...props}
        onEditorChange={(content) => form.setFieldValue(field.name, content)}
      />
    </>
  );
};

export default FormikUICustomEditor;
