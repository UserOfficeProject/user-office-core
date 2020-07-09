import { Button } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import React from 'react';

import { tableIcons } from '../../utils/materialIcons';
import { ActionButtonContainer } from '../common/ActionButtonContainer';
import InputDialog from '../common/InputDialog';

interface WithCRUDProps {
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

interface MyState {
  show: boolean;
  editObject: unknown;
}
export const withCRUD = <P extends object>(Component: React.ComponentType<P>) =>
  class WithCRUD extends React.Component<P & WithCRUDProps, MyState> {
    constructor(props: Readonly<P & WithCRUDProps>) {
      super(props);
      this.state = {
        show: false,
        editObject: null,
      };
    }
    onCreated = (objectAdded: unknown) => {
      this.props.setData([...this.props.data, objectAdded]);
    };

    onUpdated = (objectUpdated: any | null) => {
      const newObjectsArray: [

      ] = this.props.data.map((objectItem: { id: number }) =>
        objectItem.id === objectUpdated.id ? objectUpdated : objectItem
      );

      this.props.setData(newObjectsArray);
    };

    onDelete = async (deletedId: number) => {
      const deleteResult = await this.props.delete(deletedId);

      if (!deleteResult) {
        const newObjectsArray = this.props.data.filter(
          // Should be changed from instrumentId to id
          (objectItem: { instrumentId: number }) =>
            objectItem.instrumentId !== deletedId
        );
        this.props.setData(newObjectsArray);
      }
    };

    render() {
      const { actions, ...props } = this.props;
      const EditIcon = (): JSX.Element => <Edit />;
      console.log(props);

      return (
        <>
          <InputDialog
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={this.state.show}
            onClose={() => this.setState({ show: false, editObject: null })}
          >
            {this.props.createModal(
              this.onCreated,
              this.onUpdated,
              this.state.editObject
            )}
          </InputDialog>
          <Component
            {...(props as P)}
            icons={tableIcons}
            editable={{
              onRowDelete: (rowData: any): Promise<void> =>
                // Should be changed from instrumentId to id
                this.onDelete(rowData.instrumentId),
            }}
            actions={[
              {
                icon: EditIcon,
                tooltip: 'Edit',
                onClick: (_event: any, rowData: any) =>
                  this.setState({ editObject: rowData, show: true }),
                position: 'row',
              },
              ...actions,
            ]}
          />
          <ActionButtonContainer>
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={() => this.setState({ show: true })}
            >
              Create
            </Button>
          </ActionButtonContainer>
        </>
      );
    }
  };
