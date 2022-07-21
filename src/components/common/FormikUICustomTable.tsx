/* eslint-disable @typescript-eslint/ban-types */
import MaterialTable, {
  MTableAction,
  MTableToolbar,
} from '@material-table/core';
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Button from '@mui/material/Button';
import makeStyles from '@mui/styles/makeStyles';
import { FormikHelpers, FormikValues } from 'formik';
import React, { useRef } from 'react';

import { FunctionType } from 'utils/utilTypes';

import { ActionButtonContainer } from './ActionButtonContainer';
enum Direction {
  UP = -1,
  DOWN = 1,
}
function move(
  _elementRows: Record<string, unknown>[],
  _elementRowIndex: number,
  _direction: Direction
) {
  if (_elementRows !== null && _elementRowIndex > -1) {
    const elementRows = [..._elementRows];
    const rowIndex = _elementRowIndex;
    const elementRowsCount = _elementRows.length - 1;
    const swapLock =
      (rowIndex === elementRowsCount && _direction === Direction.DOWN) ||
      (rowIndex === 0 && _direction === Direction.UP);
    if (!swapLock) {
      [
        elementRows[_elementRowIndex],
        elementRows[_elementRowIndex + _direction],
      ] = [
        elementRows[_elementRowIndex + _direction],
        elementRows[_elementRowIndex],
      ];
      console.log(elementRows, ' output');

      return [...elementRows];
    }
  }
  //if last or first do nothing

  return _elementRows;
}
function getRowDataIndex(_rowData: Record<string, { id: number }>): number {
  return -1 && _rowData.tableData.id;
}

const useStyles = makeStyles((theme) => ({
  StyledButtonContainer: {
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
            disabled:
              getRowDataIndex(rowData as Record<string, { id: number }>) === 0,
            tooltip: 'Up',
            onClick: (event, rowData): void =>
              handleChange(
                move(
                  state,
                  getRowDataIndex(rowData as Record<string, { id: number }>),
                  Direction.UP
                )
              ),
          }),
          (rowData) => ({
            icon: ArrowDownwardIcon,
            disabled:
              getRowDataIndex(rowData as Record<string, { id: number }>) ===
              state.length - 1,
            tooltip: 'Down',
            onClick: (event, rowData): void =>
              handleChange(
                move(
                  state,
                  getRowDataIndex(rowData as Record<string, { id: number }>),
                  Direction.DOWN
                )
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
      <ActionButtonContainer className={classes.StyledButtonContainer}>
        <Button
          variant="outlined"
          onClick={() => addActionRef.current?.click()}
          data-cy="add-answer-button"
          size="small"
          startIcon={<AddIcon />}
        >
          Add
        </Button>
      </ActionButtonContainer>
    </>
  );
};

export default FormikUICustomTable;
