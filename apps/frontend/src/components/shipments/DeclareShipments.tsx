import {
  Typography,
  Alert,
  Stack,
  DialogContent,
  Divider,
  Paper,
} from '@mui/material';
import React, { useState } from 'react';

import StyledDialog from 'components/common/StyledDialog';
import UOLoader from 'components/common/UOLoader';
import {
  QuestionnairesList,
  QuestionnairesListRow,
} from 'components/questionary/questionaryComponents/QuestionnairesList';
import { ShipmentFragment, ShipmentStatus } from 'generated/sdk';
import { useIsTabletOrMobile } from 'hooks/common/useResponsive';
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
  const [isDirty, setIsDirty] = useState(false);

  const isMobile = useIsTabletOrMobile();

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

  const handleClose = () => {
    if (isDirty) {
      confirm(
        () => {
          setIsModalOpen(false);
          setSelectedShipment(null);
          setIsDirty(false);
        },
        {
          title: 'Close shipment declaration',
          description:
            'Are you sure you want to close? Any unsaved changes will be lost.',
        }
      )();
    } else {
      setIsModalOpen(false);
      setSelectedShipment(null);
    }
  };

  return (
    <>
      <Typography variant="h6" component="h2" sx={{ marginBottom: 3 }}>
        Declare Shipments
      </Typography>
      <Stack spacing={4} direction={isMobile ? 'column' : 'row'}>
        <Stack
          sx={{
            flex: 1,
          }}
        >
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
        <Divider orientation={isMobile ? 'horizontal' : 'vertical'} flexItem />
        <Stack
          sx={{
            flex: 1,
          }}
        >
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
      <StyledDialog
        title={
          selectedShipment ? 'Update Shipment' : 'Add Shipment Declaration'
        }
        open={isModalOpen}
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            return;
          }
          handleClose();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent dividers>
          <CreateUpdateShipment
            onShipmentSubmitted={handleSubmitted}
            onShipmentCreated={handleCreated}
            onDirtyStateChange={setIsDirty}
            experimentPk={experimentPk}
            shipment={selectedShipment}
          />
        </DialogContent>
      </StyledDialog>
    </>
  );
}

export default withConfirm(DeclareShipments);
