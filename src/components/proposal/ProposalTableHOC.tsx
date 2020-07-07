import { Button } from '@material-ui/core';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { tableIcons } from '../../utils/materialIcons';
import { ActionButtonContainer } from '../common/ActionButtonContainer';

interface WithCRUDProps {
  loading: boolean;
  create: Function;
  update: Function;
  delete: Function;
  setData: Function;
  data: any;
}

const withCRUD = <P extends object>(Component: React.ComponentType<P>) =>
  class WithCRUD extends React.Component<P & WithCRUDProps> {
    onCreated = (objectAdded: any) => {
      this.props.create(objectAdded);
      this.props.setData([...this.props.data, objectAdded]);
    };

    onUpdated = (objectUpdated: any | null) => {
      this.props.update(objectUpdated);
      const newObjectsArray: [

      ] = this.props.data.map((objectItem: { id: number }) =>
        objectItem.id === objectUpdated.id ? objectUpdated : objectItem
      );

      this.props.setData(newObjectsArray);
    };

    onDelete = async (deletedId: number) => {
      const deleteResult = this.props.delete(deletedId);

      if (!deleteResult) {
        const newObjectsArray = this.props.data.filter(
          (objectItem: { id: number }) => objectItem.id !== deletedId
        );
        this.props.setData(newObjectsArray);
      }
    };

    render() {
      const { loading, ...props } = this.props;
      console.log(this.props);

      return loading ? (
        <p>loading</p>
      ) : (
        <>
          <Component
            {...(props as P)}
            editable={{
              onRowDelete: (rowData: any): Promise<void> =>
                this.onDelete(rowData.id),
            }}
          />
          <ActionButtonContainer>
            <Button type="button" variant="contained" color="primary">
              Create
            </Button>
          </ActionButtonContainer>
        </>
      );
    }
  };

export function TestComponent() {
  const TableWithExtra = withCRUD(MaterialTable);
  const [data, setData] = useState<{ id: number; title: string }[]>([
    { id: 1, title: 'Hello' },
    { id: 2, title: 'World' },
  ]);

  return (
    <TableWithExtra
      create={() => console.log('add')}
      update={() => console.log('update')}
      delete={() => console.log('delete')}
      loading={false}
      columns={[{ title: 'Title', field: 'title' }]}
      data={data}
      icons={tableIcons}
      setData={setData}
    />
  );
}
