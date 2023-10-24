import { MaterialTableProps } from '@material-table/core';
import CloseIcon from '@mui/icons-material/Close';
import Edit from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import makeStyles from '@mui/styles/makeStyles';
import React, { SetStateAction, useState } from 'react';
import {
  DecodedValueMap,
  DelimitedArrayParam,
  NumberParam,
  QueryParamConfig,
  SetQuery,
  StringParam,
  withDefault,
} from 'use-query-params';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import MaterialTable from 'components/common/DenseMaterialTable';
import InputDialog from 'components/common/InputDialog';
import { setSortDirectionOnSortColumn } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import { FunctionType } from 'utils/utilTypes';

const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));

export type UrlQueryParamsType = {
  search: QueryParamConfig<string | null | undefined>;
  selection: QueryParamConfig<(string | null | never)[]>;
  sortColumn: QueryParamConfig<number | null | undefined>;
  sortDirection: QueryParamConfig<string | null | undefined>;
  sortField?: QueryParamConfig<string | null | undefined>;
};

export const DefaultQueryParams = {
  sortColumn: NumberParam,
  sortDirection: StringParam,
  search: StringParam,
  selection: withDefault(DelimitedArrayParam, []),
  sortField: StringParam,
};

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
  urlQueryParams?: DecodedValueMap<UrlQueryParamsType>;
  setUrlQueryParams?: SetQuery<UrlQueryParamsType>;
  extraActionButtons?: React.ReactNode;
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
  const classes = useStyles();

  let { data, columns } = props;
  const {
    setData,
    options,
    urlQueryParams,
    actions,
    createModal,
    setUrlQueryParams,
  } = props;

  // NOTE: If selection is on than read the selected items from the url.
  if (options?.selection && urlQueryParams) {
    data = data.map((objectItem) => {
      return {
        ...objectItem,
        tableData: {
          checked: urlQueryParams?.selection?.some(
            (selectedItem: number | string | null) =>
              selectedItem === objectItem.id
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

  if (options?.search && urlQueryParams) {
    options.searchText = urlQueryParams.search || undefined;
  }

  columns = setSortDirectionOnSortColumn(
    columns,
    urlQueryParams?.sortColumn,
    urlQueryParams?.sortDirection
  );

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
      <InputDialog
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
      >
        <IconButton
          data-cy="close-modal-btn"
          className={classes.closeButton}
          onClick={() => {
            setEditObject(null);
            setShow(false);
          }}
        >
          <CloseIcon />
        </IconButton>
        {createModal?.(onUpdated, onCreated, editObject)}
      </InputDialog>
      <MaterialTable
        {...props}
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
          setUrlQueryParams &&
            setUrlQueryParams({
              search: searchText ? searchText : undefined,
            });
        }}
        onSelectionChange={(selectedItems) => {
          setUrlQueryParams &&
            setUrlQueryParams({
              selection:
                selectedItems.length > 0
                  ? selectedItems.map((selectedItem) =>
                      selectedItem.id.toString()
                    )
                  : undefined,
            });
        }}
        onOrderChange={(orderedColumnId, orderDirection) => {
          setUrlQueryParams &&
            setUrlQueryParams({
              sortColumn: orderedColumnId >= 0 ? orderedColumnId : undefined,
              sortDirection: orderDirection ? orderDirection : undefined,
            });
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

export default React.memo(
  SuperMaterialTable,
  (prevProps, nextProps) => prevProps.isLoading === nextProps.isLoading
) as typeof SuperMaterialTable;
