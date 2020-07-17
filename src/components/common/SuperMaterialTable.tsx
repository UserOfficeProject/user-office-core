import { Button } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import MaterialTable, { MaterialTableProps } from 'material-table';
import React, { useState } from 'react';

import { tableIcons } from '../../utils/materialIcons';
import { ActionButtonContainer } from '../common/ActionButtonContainer';
import InputDialog from '../common/InputDialog';

interface SuperProps {
  createModal: (
    onUpdate: (object: unknown) => void,
    onCreate: (object: unknown) => void,
    object: unknown
  ) => React.ReactNode;
  delete: (id: number) => Promise<boolean>;
  setData: Function;
  actions: [any];
  data: any;
}

export default function SuperMaterialTable(
  props: MaterialTableProps<any> & SuperProps
) {
  const [show, setShow] = useState(false);
  const [editObject, setEditObject] = useState(null);

  const onCreated = (objectAdded: unknown) => {
    props.setData([...props.data, objectAdded]);
    setShow(false);
  };

  const onUpdated = (objectUpdated: any | null) => {
    console.log(objectUpdated);
    const newObjectsArray = props.data.map((objectItem: { id: number }) =>
      objectItem.id === objectUpdated.id ? objectUpdated : objectItem
    );
    props.setData(newObjectsArray);
    setEditObject(null);
    setShow(false);
  };

  const onDelete = async (deletedId: number) => {
    const deleteResult = await props.delete(deletedId);

    if (!deleteResult) {
      const newObjectsArray = props.data.filter(
        (objectItem: { id: number }) => objectItem.id !== deletedId
      );
      props.setData(newObjectsArray);
    }
  };

  const EditIcon = (): JSX.Element => <Edit />;

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
        icons={tableIcons}
        editable={{
          onRowDelete: (rowData: any): Promise<void> => onDelete(rowData.id),
        }}
        actions={[
          {
            icon: EditIcon,
            tooltip: 'Edit',
            onClick: (_event: any, rowData: any) => {
              setShow(true);
              console.log('asdadadasda');
              setEditObject(rowData);
            },
            position: 'row',
          },
          ...props.actions,
        ]}
      />
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
    </>
  );
}
