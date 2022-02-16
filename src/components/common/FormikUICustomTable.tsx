/* eslint-disable @typescript-eslint/ban-types */
import MaterialTable, {
  MTableAction,
  MTableToolbar,
} from '@material-table/core';
import { Button, makeStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { FormikHelpers, FormikValues } from 'formik';
import React, { useRef } from 'react';

import { clamp } from 'utils/Math';
import { FunctionType } from 'utils/utilTypes';

import { ActionButtonContainer } from './ActionButtonContainer';

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

const useStyles = makeStyles((theme) => ({
  buttonContainer: {
    marginTop: theme.spacing(1),
  },
  customToolbar: {
    '& .MuiToolbar-root': {
      minHeight: 0,
      height: 0,
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
  const addActionRef = useRef<HTMLDivElement>(null);
  const classes = useStyles();

  const handleChange = (newState: typeof state) => {
    setState(newState);
    form.setFieldValue(field.name, dataTransforms.fromTable(newState));
  };

  return (
    <>
      <MaterialTable
        columns={columns}
        components={{
          Action: (props) => {
            // If isn't the add action
            if (
              typeof props.action === typeof Function ||
              props.action.tooltip !== 'Add'
            ) {
              return <MTableAction {...props} />;
            } else {
              return <div ref={addActionRef} onClick={props.action.onClick} />;
            }
          },
          Toolbar: (props) => (
            <div className={classes.customToolbar}>
              <MTableToolbar {...props} />
            </div>
          ),
        }}
        data={state}
        options={{ search: false, paging: false }}
        actions={[
          (rowData) => ({
            icon: ArrowUpwardIcon,
            disabled: state.indexOf(rowData) === 0,
            tooltip: 'Up',
            onClick: (event, rowData): void =>
              handleChange(
                move(state, rowData as Record<string, unknown>, 'UP')
              ),
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
              newState[state.indexOf(oldData as Record<string, unknown>)] =
                newData;
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
      <ActionButtonContainer className={classes.buttonContainer}>
        <Button
          variant="outlined"
          onClick={() => addActionRef.current?.click()}
          data-cy="add-answer-button"
          size="small"
          color="primary"
          startIcon={<AddIcon />}
        >
          Add
        </Button>
      </ActionButtonContainer>
    </>
  );
};

export default FormikUICustomTable;
