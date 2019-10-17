import React, { forwardRef } from "react";
import MaterialTable, { Icons } from "material-table";
import { FormikActions } from "formik";

import AddBox from "@material-ui/icons/AddBox";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";

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
  form: FormikActions<any>;
}) => {
  const transformedValues = dataTransforms.toTable(field.value);
  const [state, setState] = React.useState(transformedValues);
  const tableIcons: Icons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => (
      <ChevronRight {...props} ref={ref} />
    )),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => (
      <ChevronLeft {...props} ref={ref} />
    )),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => (
      <Remove {...props} ref={ref} />
    )),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
  };
  return (
    <MaterialTable
      icons={tableIcons}
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
          })
      }}
      {...props}
    />
  );
};

export default FormikUICustomTable;
