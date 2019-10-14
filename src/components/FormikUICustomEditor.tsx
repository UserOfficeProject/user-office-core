import React from "react";
import { Editor } from "@tinymce/tinymce-react";
import { FormikActions } from "formik";
const FormikUICustomEditor = ({
  field,
  form,
  ...props
}: {
  field: { name: string; onBlur: Function; onChange: Function; value: string };
  form: FormikActions<any>;
}) => {
  return (
    <Editor
      initialValue={field.value}
      {...props}
      onEditorChange={content => form.setFieldValue(field.name, content)}
    />
  );
};

export default FormikUICustomEditor;
