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

import { deepEqual } from 'utils/json';
import { FunctionType } from 'utils/utilTypes';

import { ActionButtonContainer } from './ActionButtonContainer';

enum Direction {
  UP = -1,
  DOWN = 1,
}

function getElementIndex(
  elements: Record<string, unknown>[],
  element: Record<string, unknown>
): number {
  if (!(elements && element)) {
    return -1;
  }
  type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
  const newElement = {} as Flatten<typeof elements>;
  Object.entries(element as typeof newElement).forEach(([key, value]) => {
    if (Object.getOwnPropertyNames(elements[0]).includes(key)) {
      newElement[key as keyof typeof newElement] = value;
    }
  });

  return elements.findIndex((value) => deepEqual(value, newElement));
}

function move(
  elements: Record<string, unknown>[],
  elementIndex: number,
  direction: Direction
) {
  if (elements !== null && elementIndex > -1) {
    const elementRows = [...elements];
    const rowIndex = elementIndex;
    const elementRowsCount = elements.length - 1;
    const swapLock =
      (rowIndex === elementRowsCount && direction === Direction.DOWN) ||
      (rowIndex === 0 && direction === Direction.UP);
    if (!swapLock) {
      [elementRows[elementIndex], elementRows[elementIndex + direction]] = [
        elementRows[elementIndex + direction],
        elementRows[elementIndex],
      ];

      return [...elementRows];
    }
  }

  return elements;
}

function updateElement(
  elements: Record<string, unknown>[],
  oldelement: Record<string, unknown>,
  newelement: Record<string, unknown>
) {
  const newElements = [...elements];
  const elementIndex = getElementIndex(elements, oldelement);

  return elements &&
    elementIndex > -1 &&
    newElements.splice(elementIndex, 1, newelement)
    ? newElements
    : elements;
}
function removeElement(
  elements: Record<string, unknown>[],
  removeelement: Record<string, unknown>
) {
  const newElements = [...elements];
  const elementIndex = getElementIndex(elements, removeelement);

  return elements && elementIndex > -1 && newElements.splice(elementIndex, 1)
    ? newElements
    : elements;
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
            disabled: getElementIndex(state, rowData) === 0,
            tooltip: 'Up',
            onClick: (event, rowData): void =>
              handleChange(
                move(
                  state,
                  getElementIndex(state, rowData as Record<string, unknown>),
                  Direction.UP
                )
              ),
          }),
          (rowData) => ({
            icon: ArrowDownwardIcon,
            disabled: getElementIndex(state, rowData) === state.length - 1,
            tooltip: 'Down',
            onClick: (event, rowData): void =>
              handleChange(
                move(
                  state,
                  getElementIndex(state, rowData as Record<string, unknown>),
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
              handleChange(
                updateElement(
                  state,
                  oldData as Record<string, unknown>,
                  newData as Record<string, unknown>
                )
              );
              resolve();
            }),
          onRowDelete: (oldData) =>
            new Promise<void>((resolve) => {
              handleChange(removeElement(state, oldData));
              resolve();
            }),
        }}
        {...props}
      />
      <ActionButtonContainer className={classes.StyledButtonContainer}>
        <Button
          variant="outlined"
          onClick={() => addActionRef.current?.click()}
          data-cy="add-item-button"
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
