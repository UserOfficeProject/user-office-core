import { Delete } from '@material-ui/icons';
import GetAppIcon from '@material-ui/icons/GetApp';
import React from 'react';
import { useQueryParams } from 'use-query-params';

import {
  DefaultQueryParams,
  SuperMaterialTable,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import UOLoader from 'components/common/UOLoader';
import { ShipmentStatus } from 'generated/sdk';
import { useShipments } from 'hooks/shipment/useShipments';
import { ShipmentBasic } from 'models/ShipmentSubmissionState';
import { tableIcons } from 'utils/materialIcons';
import { timeAgo } from 'utils/Time';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import CreateUpdateShipment from './CreateUpdateShipment';

const ShipmentsTable = (props: { confirm: WithConfirmType }) => {
  const { loadingShipments, shipments, setShipments } = useShipments();
  const [
    urlQueryParams,
    setUrlQueryParams,
  ] = useQueryParams<UrlQueryParamsType>(DefaultQueryParams);
  const { api } = useDataApiWithFeedback();

  if (!shipments) {
    return <UOLoader />;
  }

  const columns = [
    { title: 'Title', field: 'title' },
    { title: 'Status', field: 'status' },
    {
      title: 'Created',
      field: 'created',
      render: (rowData: ShipmentBasic): string => timeAgo(rowData.created),
    },
  ];

  const deleteHandler = (shipmentToDelete: ShipmentBasic) => {
    props.confirm(
      () => {
        api()
          .deleteShipment({
            shipmentId: shipmentToDelete.id,
          })
          .then((data) => {
            if (!data.deleteShipment.error) {
              setShipments(
                shipments.filter(
                  (shipment) => shipment.id !== shipmentToDelete.id
                )
              );
            }
          });
      },
      {
        title: 'Are you sure?',
        description: `Are you sure you want to delete "${shipmentToDelete.title}"`,
      }
    )();
  };

  const createModal = (
    onUpdate: (object: ShipmentBasic | null) => void,
    onCreate: (object: ShipmentBasic | null) => void,
    editShipment: ShipmentBasic | null
  ) => (
    <CreateUpdateShipment
      shipment={editShipment}
      close={(shipment: ShipmentBasic | null) =>
        !!editShipment ? onUpdate(shipment) : onCreate(shipment)
      }
    />
  );

  return (
    <div data-cy="shipments-table">
      <SuperMaterialTable
        setData={setShipments}
        createModal={createModal}
        hasAccess={{ update: true, create: true, remove: true }}
        icons={tableIcons}
        title="Shipments"
        columns={columns}
        isLoading={loadingShipments}
        data={shipments}
        urlQueryParams={urlQueryParams}
        setUrlQueryParams={setUrlQueryParams}
        actions={[
          (rowData) =>
            rowData.status === ShipmentStatus.DRAFT
              ? {
                  icon: Delete,
                  tooltip: 'Delete shipment',
                  onClick: (_event, rowData) =>
                    deleteHandler(rowData as ShipmentBasic),
                }
              : {
                  icon: GetAppIcon,
                  tooltip: 'Download label',
                  onClick: () => console.log('Download'),
                },
        ]}
      />
    </div>
  );
};

export default withConfirm(ShipmentsTable);
