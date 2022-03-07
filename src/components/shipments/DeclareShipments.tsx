import { Dialog, DialogContent, Divider, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React, { useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import {
  QuestionnairesList,
  QuestionnairesListRow,
} from 'components/questionary/questionaryComponents/QuestionnairesList';
import { ShipmentFragment, ShipmentStatus } from 'generated/sdk';
import { useScheduledEvent } from 'hooks/scheduledEvent/useScheduledEvent';
import { useShipments } from 'hooks/shipment/useShipments';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmProps } from 'utils/withConfirm';

import CreateUpdateShipment from './CreateUpdateShipment';

interface DeclareShipmentsProps extends WithConfirmProps {
  scheduledEventId: number;
}

const shipmentToListRow = (
  shipment: ShipmentFragment
): QuestionnairesListRow => {
  return {
    id: shipment.id,
    label: shipment.title,
    isCompleted: shipment.status === ShipmentStatus.SUBMITTED,
  };
};

function DeclareShipments({
  scheduledEventId,
  confirm,
}: DeclareShipmentsProps) {
  const { api } = useDataApiWithFeedback();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { shipments, setShipments } = useShipments({
    scheduledEventId: scheduledEventId,
  });

  const { scheduledEvent } = useScheduledEvent(scheduledEventId);

  const [selectedShipment, setSelectedShipment] =
    useState<ShipmentFragment | null>(null);

  if (!shipments || !scheduledEvent) {
    return <UOLoader />;
  }

  const handleCreated = (shipment: ShipmentFragment) => {
    setShipments([...shipments, shipment]);
  };

  const handleSubmitted = (shipment: ShipmentFragment) => {
    setShipments(shipments.map((s) => (s.id === shipment.id ? shipment : s)));
  };

  const deleteShipment = (shipmentId: number) => {
    api()
      .deleteShipment({ shipmentId })
      .then((result) => {
        if (result.deleteShipment.rejection) {
          // error occurred
          return;
        }
        setShipments(shipments.filter((s) => s.id !== shipmentId));
      });
  };

  const onDeleteClicked = (item: QuestionnairesListRow) => {
    const shipment = shipments.find((s) => s.id === item.id);
    if (shipment?.status === ShipmentStatus.SUBMITTED) {
      alert('Cannot delete a submitted shipment'); // TODO implement withAlert

      return;
    }

    confirm(() => deleteShipment(item.id), {
      title: 'Delete Sample',
      description:
        'This action will delete the sample and all data associated with it',
    })();
  };

  const onAddClicked = () => {
    setIsModalOpen(true);
  };

  const hasLocalContact = scheduledEvent.localContactId !== null;

  return (
    <>
      <Typography
        variant="h4"
        style={{ marginBottom: '12px', textAlign: 'center' }}
      >
        Declare Shipments
      </Typography>
      <Typography>
        Follow the steps below to declare your shipments:
        <ol style={{ margin: 0, paddingBottom: '22px' }}>
          <li>Add all the shipments (one shipment per parcel)</li>
          <li>Download labels</li>
          <li>Post the shipment</li>
        </ol>
      </Typography>
      {!hasLocalContact && (
        <Alert severity="warning">
          Shipment declarations are not possible until the local contact has
          been assigned to your scheduled event
        </Alert>
      )}
      <QuestionnairesList
        addButtonLabel="Add Shipment"
        data={shipments.map(shipmentToListRow) ?? []}
        onEditClick={(item) =>
          api()
            .getShipment({ shipmentId: item.id })
            .then(({ shipment }) => {
              setSelectedShipment(shipment);
              setIsModalOpen(true);
            })
        }
        onDeleteClick={onDeleteClicked}
        onAddNewClick={hasLocalContact ? onAddClicked : undefined}
        style={{ maxWidth: '100%' }}
      />
      <Divider style={{ margin: '12px 0' }} />
      <Typography variant="body1" align="right">
        {`${shipments.length} shipment(s)`}
      </Typography>

      <Dialog
        aria-labelledby="shipment-declaration"
        aria-describedby="shipment-declaration-description"
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedShipment(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <CreateUpdateShipment
            onShipmentSubmitted={handleSubmitted}
            onShipmentCreated={handleCreated}
            scheduledEventId={scheduledEventId}
            shipment={selectedShipment}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default withConfirm(DeclareShipments);
