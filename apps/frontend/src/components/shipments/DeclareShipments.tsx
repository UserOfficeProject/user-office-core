import {
  Typography,
  Alert,
  Stack,
  Dialog,
  DialogContent,
  Divider,
  Paper,
} from '@mui/material';
import React, { useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import {
  QuestionnairesList,
  QuestionnairesListRow,
} from 'components/questionary/questionaryComponents/QuestionnairesList';
import { ShipmentFragment, ShipmentStatus } from 'generated/sdk';
import { useExperiment } from 'hooks/experiment/useExperiment';
import { useShipments } from 'hooks/shipment/useShipments';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmProps } from 'utils/withConfirm';

import CreateUpdateShipment from './CreateUpdateShipment';
import ShippingInstructions from './ShippingInstructions';

interface DeclareShipmentsProps extends WithConfirmProps {
  experimentPk: number;
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

function DeclareShipments({ experimentPk, confirm }: DeclareShipmentsProps) {
  const { api } = useDataApiWithFeedback();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { shipments, setShipments } = useShipments({
    experimentPk: experimentPk,
  });

  const { experiment } = useExperiment(experimentPk);

  const [selectedShipment, setSelectedShipment] =
    useState<ShipmentFragment | null>(null);

  if (!shipments || !experiment) {
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
      .then(() => {
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

  const onEditClicked = (item: QuestionnairesListRow): Promise<void> =>
    api()
      .getShipment({ shipmentId: item.id })
      .then(({ shipment }) => {
        setSelectedShipment(shipment);
        setIsModalOpen(true);
      });

  const onAddClicked = () => {
    setIsModalOpen(true);
  };

  const hasLocalContact = experiment.localContactId !== null;

  return (
    <>
      <Typography variant="h6" component="h2" sx={{ marginBottom: 3 }}>
        Declare Shipments
      </Typography>
      <Stack spacing={4} direction="row">
        <Stack flex={1}>
          <Typography variant="h6" component="h2" sx={{ paddingBottom: 3 }}>
            Shipment guide
          </Typography>
          <ShippingInstructions />
          {!hasLocalContact && (
            <Alert
              severity="warning"
              sx={(theme) => ({
                margin: `${theme.spacing(2)}px 0`,
              })}
            >
              Shipment declarations are not possible until the local contact has
              been assigned to your scheduled event
            </Alert>
          )}
        </Stack>
        <Divider orientation="vertical" flexItem />
        <Stack flex={1}>
          <Typography variant="h6" component="h2" sx={{ paddingBottom: 3 }}>
            My shipment list
          </Typography>
          <Paper sx={{ padding: 3 }}>
            <QuestionnairesList
              addButtonLabel="Add Shipment Declaration"
              data={shipments.map(shipmentToListRow) ?? []}
              onEditClick={onEditClicked}
              onDeleteClick={onDeleteClicked}
              onAddNewClick={hasLocalContact ? onAddClicked : undefined}
              style={{ maxWidth: '100%' }}
            />
          </Paper>
        </Stack>
      </Stack>
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
            experimentPk={experimentPk}
            shipment={selectedShipment}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default withConfirm(DeclareShipments);
