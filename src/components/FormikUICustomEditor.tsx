import React from "react";
import { Editor } from "@tinymce/tinymce-react";
import { FormikActions } from "formik";
export const FormikUICustomEditor = ({
  field,
  form,
  ...props
}: {
  initialValue: string;
  field:{name:string, onBlur:Function, onChange:Function, value:string},
  form:FormikActions<any>
  onEditorChange: (content: string) => void;
}) => {
  return <Editor initialValue={field.value} {...props} onEditorChange={content => form.setFieldValue(field.name, content)} />;
};
