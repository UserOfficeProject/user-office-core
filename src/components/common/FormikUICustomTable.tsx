/* eslint-disable @typescript-eslint/ban-types */
import makeStyles from '@material-ui/core/styles/makeStyles';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { FormikHelpers, FormikValues } from 'formik';
import MaterialTable, { MTableToolbar, Options } from 'material-table';
import React, { forwardRef } from 'react';

import { tableIcons } from 'utils/materialIcons';
import { clamp } from 'utils/Math';
import { FunctionType } from 'utils/utilTypes';

function move(
  array: Record<string, unknown>[],
  element: Record<string, unknown>,
  direction: 'UP' | 'DOWN'
) {
  const currentIndex = array.indexOf(element);
  const delta = direction === 'DOWN' ? 1 : -1;
  const newIndex = clamp(currentIndex + delta, 0, array.length - 1);
  if (currentIndex !== newIndex) {
    const newArray = [...array];
    newArray.splice(currentIndex, 1);
    newArray.splice(newIndex, 0, element);

    return newArray;
  }

  return array;
}

const useStyles = makeStyles(() => ({
  customToolbar: {
    '& .MuiToolbar-root': {
      minHeight: 'auto',
      '& button': {
        padding: 0,
      },
    },
  },
}));

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
    toTable: (input: unknown) => Record<string, unknown>[];
    fromTable: (input: Record<string, unknown>[]) => unknown;
  };
  field: {
    name: string;
    onBlur: FunctionType;
    onChange: FunctionType;
    value: string | undefined;
  };
  form: FormikHelpers<FormikValues>;
}) => {
  const transformedValues = dataTransforms.toTable(field.value);
  const [state, setState] = React.useState(transformedValues);
  const classes = useStyles();

  const handleChange = (newState: typeof state) => {
    setState(newState);
    form.setFieldValue(field.name, dataTransforms.fromTable(newState));
  };

  const AddNewItemIcon = () => (
    <div data-cy="add-answer-button">
      <AddCircleOutlineIcon />
    </div>
  );

  const StyledToolbar = (props: Options) => (
    <div className={classes.customToolbar}>
      <MTableToolbar {...props} />
    </div>
  );

  return (
    <MaterialTable
      icons={{
        ...tableIcons,
        Add: forwardRef(AddNewItemIcon),
      }}
      columns={columns}
      components={{
        Toolbar: StyledToolbar,
      }}
      data={state}
      options={{ search: false, paging: false }}
      actions={[
        (rowData) => ({
          icon: ArrowUpwardIcon,
          disabled: state.indexOf(rowData) === 0,
          tooltip: 'Up',
          onClick: (event, rowData): void =>
            handleChange(move(state, rowData as Record<string, unknown>, 'UP')),
        }),
        (rowData) => ({
          icon: ArrowDownwardIcon,
          disabled: state.indexOf(rowData) === state.length - 1,
          tooltip: 'Down',
          onClick: (event, rowData): void =>
            handleChange(
              move(state, rowData as Record<string, unknown>, 'DOWN')
            ),
        }),
      ]}
      editable={{
        onRowAdd: (newData) =>
          new Promise<void>((resolve) => {
            handleChange([...state, newData]);
            resolve();
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise<void>((resolve) => {
            const newState = [...state];
            newState[
              state.indexOf(oldData as Record<string, unknown>)
            ] = newData;
            handleChange(newState);
            resolve();
          }),
        onRowDelete: (oldData) =>
          new Promise<void>((resolve) => {
            const newState = [...state];
            newState.splice(state.indexOf(oldData), 1);
            handleChange(newState);
            resolve();
          }),
      }}
      {...props}
    />
  );
};

export default FormikUICustomTable;
