import makeStyles from '@material-ui/core/styles/makeStyles';
import { Editor } from '@tinymce/tinymce-react';
import { FormikActions } from 'formik';
import React from 'react';

const FormikUICustomEditor = ({
  field,
  form,
  ...props
}: {
  field: { name: string; onBlur: Function; onChange: Function; value: string };
  form: FormikActions<any>;
  label?: string;
}) => {
  const classes = makeStyles(theme => ({
    label: {
      marginTop: '17px',
      fontSize: '1.1875em',
      display: 'block',
      color: theme.palette.grey[800],
    },
  }))();

  return (
    <>
      {props.label && <label className={classes.label}>{props.label}</label>}
      <Editor
        initialValue={field.value}
        {...props}
        onEditorChange={content => form.setFieldValue(field.name, content)}
      />
    </>
  );
};

export default FormikUICustomEditor;
