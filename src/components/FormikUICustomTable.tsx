import React from "react";
import MaterialTable from "material-table";
import { FormikActions } from "formik";
export const FormikUICustomTable = ({
  columns,
  dataTransforms,
  field,
  form,
  ...props
}: {
  columns: {
    title: string;
    field: string;
  }[];
  dataTransforms: {
    toTable: (input: any) => any[];
    fromTable: (input: any[]) => any;
  };
  field: {
    name: string;
    onBlur: Function;
    onChange: Function;
    value: string;
  }; 
  form: FormikActions<any>;
}) => {
  const transformedValues = dataTransforms.toTable(field.value);
  const [state, setState] = React.useState(transformedValues);
  return (
    <MaterialTable
      columns={columns}
      data={state}
      editable={{
        onRowAdd: newData =>
          new Promise(resolve => {
            const data = [...state];
            data.push(newData);
            setState(data);
            form.setFieldValue(field.name, dataTransforms.fromTable(data));
            resolve();
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise(resolve => {
            const data = [...state];
            data[data.indexOf(oldData!)] = newData;
            setState(data);
            form.setFieldValue(field.name, dataTransforms.fromTable(data));
            resolve();
          }),
        onRowDelete: oldData =>
          new Promise(resolve => {
            const data = [...state];
            data.splice(data.indexOf(oldData), 1);
            setState(data);
            form.setFieldValue(field.name, dataTransforms.fromTable(data));
            resolve();
          })
      }}
      {...props}
    />
  );
};
