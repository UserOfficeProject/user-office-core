import Button from '@material-ui/core/Button';
import Edit from '@material-ui/icons/Edit';
import MaterialTable, { MaterialTableProps } from 'material-table';
import React, { useState } from 'react';
import {
  QueryParamConfig,
  DecodedValueMap,
  SetQuery,
  DelimitedNumericArrayParam,
  NumberParam,
  StringParam,
  withDefault,
} from 'use-query-params';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';
import { tableIcons } from 'utils/materialIcons';

export type UrlQueryParamsType = {
  search: QueryParamConfig<string | null | undefined>;
  selection: QueryParamConfig<(number | null | never)[]>;
  sortColumn: QueryParamConfig<number | null | undefined>;
  sortDirection: QueryParamConfig<string | null | undefined>;
};

export const DefaultQueryParams = {
  sortColumn: NumberParam,
  sortDirection: StringParam,
  search: StringParam,
  selection: withDefault(DelimitedNumericArrayParam, []),
};

interface SuperProps<RowData extends object> {
  createModal: (
    onUpdate: (object: RowData) => void,
    onCreate: (object: RowData) => void,
    object: RowData | null
  ) => React.ReactNode;
  setData: Function;
  data: RowData[];
  delete?: (id: number) => Promise<boolean>;
  hasAccess?: { create?: boolean; update?: boolean; remove?: boolean };
  urlQueryParams?: DecodedValueMap<UrlQueryParamsType>;
  setUrlQueryParams?: SetQuery<UrlQueryParamsType>;
}

interface EntryID {
  id: number;
}

function SuperMaterialTable<Entry extends EntryID>({
  hasAccess = {
    create: true,
    remove: true,
    update: true,
  },
  ...props
}: MaterialTableProps<Entry> & SuperProps<Entry>) {
  const [show, setShow] = useState(false);
  const [editObject, setEditObject] = useState<Entry | null>(null);

  let { data } = props;

  // NOTE: If selection is on than read the selected items from the url.
  if (props.options?.selection && props.urlQueryParams) {
    data = data.map(objectItem => {
      return {
        ...objectItem,
        tableData: {
          checked: props.urlQueryParams?.selection?.some(
            (selectedItem: number | null) => selectedItem === objectItem.id
          ),
        },
      };
    });
  }

  if (props.options?.search && props.urlQueryParams) {
    props.options.searchText = props.urlQueryParams.search || undefined;
  }

  const { columns } = props;

  if (
    props.urlQueryParams?.sortColumn !== undefined &&
    props.urlQueryParams?.sortColumn !== null &&
    props.urlQueryParams?.sortDirection
  ) {
    columns[props.urlQueryParams.sortColumn].defaultSort = props.urlQueryParams
      .sortDirection as 'asc' | 'desc' | undefined;
  }

  const onCreated = (objectAdded: Entry) => {
    props.setData([...data, objectAdded]);
    setShow(false);
  };

  const onUpdated = (objectUpdated: Entry) => {
    if (objectUpdated) {
      const newObjectsArray = data.map(objectItem =>
        objectItem.id === objectUpdated.id ? objectUpdated : objectItem
      );
      props.setData(newObjectsArray);
    }
    setEditObject(null);
    setShow(false);
  };

  const onDeleted = async (deletedId: number) => {
    const deleteResult = await (props.delete as Function)(deletedId);

    if (deleteResult) {
      const newObjectsArray = data.filter(
        objectItem => objectItem.id !== deletedId
      );
      props.setData(newObjectsArray);
    }
  };

  const EditIcon = (): JSX.Element => <Edit />;
  let actions: (
    | import('material-table').Action<Entry>
    | ((rowData: Entry) => import('material-table').Action<Entry>)
  )[] = [];
  if (props.actions) {
    actions = props.actions;
  }

  return (
    <>
      <InputDialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={show}
        onClose={() => {
          setShow(false);
          setEditObject(null);
        }}
      >
        {props.createModal(onUpdated, onCreated, editObject)}
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
                ...actions,
              ]
            : [...actions]
        }
        onSearchChange={searchText => {
          props.setUrlQueryParams &&
            props.setUrlQueryParams({
              search: searchText ? searchText : undefined,
            });
        }}
        onSelectionChange={selectedItems => {
          props.setUrlQueryParams &&
            props.setUrlQueryParams({
              selection:
                selectedItems.length > 0
                  ? selectedItems.map(selectedItem => selectedItem.id)
                  : undefined,
            });
        }}
        onOrderChange={(orderedColumnId, orderDirection) => {
          props.setUrlQueryParams &&
            props.setUrlQueryParams({
              sortColumn: orderedColumnId >= 0 ? orderedColumnId : undefined,
              sortDirection: orderDirection ? orderDirection : undefined,
            });
        }}
      />
      {hasAccess.create && (
        <ActionButtonContainer>
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={() => setShow(true)}
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
