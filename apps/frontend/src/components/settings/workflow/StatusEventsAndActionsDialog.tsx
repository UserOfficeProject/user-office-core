import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import React, { Dispatch, SetStateAction } from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import {
  Event as WorkflowEvent,
  WorkflowConnection,
  WorkflowType,
} from 'generated/sdk';

import AddStatusActionsToConnection from './AddStatusActionsToConnection';
import AddStatusChangingEventsToConnection from './AddStatusChangingEventsToConnection';
import { EventType, Event } from './WorkflowEditorModel';

type StatusEventsAndActionsDialogProps = {
  workflowConnection: WorkflowConnection | null;
  setWorkflowConnection: Dispatch<SetStateAction<WorkflowConnection | null>>;
  dispatch: Dispatch<Event>;
  isLoading: boolean;
  entityType: WorkflowType;
};

const StatusEventsAndActionsDialog = ({
  workflowConnection,
  setWorkflowConnection,
  dispatch,
  isLoading,
  entityType,
}: StatusEventsAndActionsDialogProps) => {
  const theme = useTheme();

  const close = () => {
    setWorkflowConnection(null);
  };

  return (
    <Dialog
      maxWidth="lg"
      fullWidth
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={!!workflowConnection}
      onClose={close}
      data-cy="status-events-and-actions-modal"
    >
      <DialogTitle>Status events and actions</DialogTitle>
      <IconButton
        data-cy="close-modal"
        sx={{
          position: 'absolute',
          right: theme.spacing(1),
          top: theme.spacing(1),
        }}
        onClick={close}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent
        sx={{
          overflow: 'hidden',
          [theme.breakpoints.only('xs')]: {
            overflow: 'auto',
          },
        }}
      >
        <SimpleTabs
          tabNames={['Next status events', 'Status actions']}
          tabPanelPadding={theme.spacing(0, 3)}
        >
          <AddStatusChangingEventsToConnection
            statusChangingEvents={
              workflowConnection?.statusChangingEvents?.map(
                (statusChangingEvent) => statusChangingEvent.statusChangingEvent
              ) as WorkflowEvent[]
            }
            statusName={workflowConnection?.status.name}
            addStatusChangingEventsToConnection={(
              statusChangingEvents: string[]
            ) =>
              dispatch({
                type: EventType.ADD_NEXT_STATUS_EVENTS_REQUESTED,
                payload: {
                  statusChangingEvents,
                  workflowConnection,
                },
              })
            }
            isLoading={isLoading}
            entityType={entityType}
          />
          <AddStatusActionsToConnection
            addStatusActionsToConnection={(statusActions) => {
              dispatch({
                type: EventType.ADD_STATUS_ACTION_REQUESTED,
                payload: {
                  statusActions,
                  workflowConnection,
                },
              });
            }}
            connectionStatusActions={workflowConnection?.statusActions}
            statusName={workflowConnection?.status.name}
            isLoading={isLoading}
          />
        </SimpleTabs>
      </DialogContent>
    </Dialog>
  );
};

export default StatusEventsAndActionsDialog;
