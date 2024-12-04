import { MaterialTableProps } from '@material-table/core';
import Edit from '@mui/icons-material/Edit';
import { DialogContent, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import React, { SetStateAction, useMemo, useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import MaterialTable from 'components/common/DenseMaterialTable';
import { useTypeSafeSearchParams } from 'hooks/common/useTypeSafeSearchParams';
import { setSortDirectionOnSortField } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import { FunctionType } from 'utils/utilTypes';

import StyledDialog from './StyledDialog';

export type SortDirectionType = 'asc' | 'desc' | undefined;

interface SuperProps<RowData extends Record<keyof RowData, unknown>> {
  createModal?: (
    onUpdate: (
      object: RowData | null,
      shouldCloseAfterUpdate?: boolean
    ) => void,
    onCreate: (
      object: RowData | null,
      shouldCloseAfterCreation?: boolean
    ) => void,
    object: RowData | null
  ) => React.ReactNode;
  setData: FunctionType<void, [SetStateAction<RowData[]>]>;
  data: RowData[];
  createModalSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  delete?: (id: number | string) => Promise<boolean>;
  hasAccess?: { create?: boolean; update?: boolean; remove?: boolean };
  extraActionButtons?: React.ReactNode;
  persistUrlQueryParams?: boolean;
}

interface EntryID {
  id: number | string;
}

export function SuperMaterialTable<Entry extends EntryID>({
  hasAccess = {
    create: true,
    remove: true,
    update: true,
  },
  extraActionButtons,

  ...props
}: MaterialTableProps<Entry> & SuperProps<Entry>) {
  const [show, setShow] = useState(false);
  const [editObject, setEditObject] = useState<Entry | null>(null);

  let { data, columns } = props;
  const { setData, options, actions, createModal } = props;
  const { persistUrlQueryParams = false } = props;

  const initialParams = useMemo(
    () => ({
      search: '',
      selection: [],
      sortField: '',
      sortDirection: '',
    }),
    []
  );

  const [typedParams, setTypedParams] = useTypeSafeSearchParams<{
    search: string;
    selection: string[];
    sortField: string;
    sortDirection: string;
  }>(initialParams);

  const selection = persistUrlQueryParams ? typedParams.selection : [];
  const search = persistUrlQueryParams ? typedParams.search : '';
  const sortField = persistUrlQueryParams ? typedParams.sortField : '';
  const sortDirection = persistUrlQueryParams ? typedParams.sortDirection : '';

  // NOTE: If selection is on than read the selected items from the url.
  if (options?.selection) {
    data = data.map((objectItem) => {
      return {
        ...objectItem,
        tableData: {
          checked: selection.some(
            (selectedItem) => selectedItem === objectItem.id
          ),
        },
      };
    });
  }

  if (options?.selection) {
    options.headerSelectionProps = {
      inputProps: { 'aria-label': 'Select All Rows' },
    };
  }

  if (options?.search) {
    options.searchText = search || undefined;
  }

  columns = setSortDirectionOnSortField(columns, sortField, sortDirection);

  const onCreated = (
    objectAdded: Entry | null,
    shouldCloseAfterCreation = true
  ) => {
    if (objectAdded) {
      setData([...data, objectAdded]);
    }

    if (shouldCloseAfterCreation) {
      setShow(false);
    } else {
      setEditObject(objectAdded);
    }
  };

  const onUpdated = (
    objectUpdated: Entry | null,
    shouldCloseAfterUpdate = true
  ) => {
    if (objectUpdated) {
      const newObjectsArray = data.map((objectItem) =>
        objectItem.id === objectUpdated.id ? objectUpdated : objectItem
      );
      setData(newObjectsArray);
    }

    if (shouldCloseAfterUpdate) {
      setEditObject(null);
      setShow(false);
    }
  };

  const onDeleted = async (deletedId: number | string) => {
    const deleteResult = await (props.delete as FunctionType<Promise<unknown>>)(
      deletedId
    );

    if (deleteResult) {
      const newObjectsArray = data.filter(
        (objectItem) => objectItem.id !== deletedId
      );
      setData(newObjectsArray);
    }
  };

  const EditIcon = (): JSX.Element => <Edit />;
  let localActions: (
    | import('@material-table/core').Action<Entry>
    | ((rowData: Entry) => import('@material-table/core').Action<Entry>)
    | {
        action: (
          rowData: Entry
        ) => import('@material-table/core').Action<Entry>;
        position: string;
      }
  )[] = [];
  if (actions) {
    localActions = actions;
  }

  return (
    <>
      <StyledDialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        data-cy="create-modal"
        open={show}
        maxWidth={props.createModalSize}
        fullWidth={!!props.createModalSize}
        onClose={(_, reason) => {
          if (reason && reason == 'backdropClick') return;
          setEditObject(null);
          setShow(false);
        }}
        title="Create"
      >
        <DialogContent dividers>
          {createModal?.(onUpdated, onCreated, editObject)}
        </DialogContent>
      </StyledDialog>
      <MaterialTable
        {...props}
        title={
          <Typography variant="h6" component="h2">
            {props.title}
          </Typography>
        }
        columns={columns}
        data={data}
        icons={tableIcons}
        editable={
          props.delete && hasAccess.remove
            ? {
                onRowDelete: (rowData: Entry): Promise<void> =>
                  onDeleted(rowData.id),
              }
            : {}
        }
        actions={
          hasAccess.update
            ? [
                {
                  icon: EditIcon,
                  tooltip: 'Edit',
                  onClick: (
                    _event: React.MouseEvent<JSX.Element>,
                    rowData: Entry | Entry[]
                  ) => {
                    setShow(true);
                    setEditObject(rowData as Entry);
                  },
                  position: 'row',
                },
                ...localActions,
              ]
            : [...localActions]
        }
        onSearchChange={(searchText) => {
          persistUrlQueryParams &&
            setTypedParams((prev) => ({ ...prev, search: searchText }));
        }}
        onSelectionChange={(selectedItems) => {
          persistUrlQueryParams &&
            setTypedParams((prev) => ({
              ...prev,
              selection: selectedItems.map((selectedItem) =>
                selectedItem.id.toString()
              ),
            }));
        }}
        onOrderCollectionChange={(orderByCollection) => {
          const [orderBy] = orderByCollection;
          persistUrlQueryParams &&
            setTypedParams((prev) => ({
              ...prev,
              sortField: orderBy?.orderByField ?? '',
              sortDirection: orderBy?.orderDirection ?? '',
            }));
        }}
      />
      {hasAccess.create && createModal && (
        <ActionButtonContainer>
          {extraActionButtons && extraActionButtons}
          <Button
            type="button"
            onClick={() => setShow(true)}
            data-cy="create-new-entry"
          >
            Create
          </Button>
        </ActionButtonContainer>
      )}
    </>
  );
}

export default SuperMaterialTable;
