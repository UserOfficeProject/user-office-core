import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { FormikHelpers } from 'formik';
import MaterialTable from 'material-table';
import React, { forwardRef } from 'react';

import { tableIcons } from 'utils/materialIcons';

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
    value: string | undefined;
  };
  form: FormikHelpers<any>;
}) => {
  const transformedValues = dataTransforms.toTable(field.value);
  const [state, setState] = React.useState(transformedValues);

  return (
    <MaterialTable
      icons={{
        ...tableIcons,
        Add: forwardRef(() => (
          <div data-cy="add-answer-button">
            <AddCircleOutlineIcon />
          </div>
        )),
      }}
      columns={columns}
      data={state}
      options={{ search: false, paging: false }}
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
          }),
      }}
      {...props}
    />
  );
};

export default FormikUICustomTable;
