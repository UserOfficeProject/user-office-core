import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import makeStyles from '@mui/styles/makeStyles';
import useTheme from '@mui/styles/useTheme';
import React, { Dispatch, SetStateAction } from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import {
  Event as ProposalEvent,
  ProposalWorkflowConnection,
} from 'generated/sdk';

import AddStatusActionsToConnection from './AddStatusActionsToConnection';
import AddStatusChangingEventsToConnection from './AddStatusChangingEventsToConnection';
import { EventType, Event } from './ProposalWorkflowEditorModel';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    overflow: 'hidden',
    [theme.breakpoints.only('xs')]: {
      overflow: 'auto',
    },
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));

type StatusEventsAndActionsDialogProps = {
  workflowConnection: ProposalWorkflowConnection | null;
  setWorkflowConnection: Dispatch<
    SetStateAction<ProposalWorkflowConnection | null>
  >;
  dispatch: Dispatch<Event>;
  isLoading: boolean;
};

const StatusEventsAndActionsDialog = ({
  workflowConnection,
  setWorkflowConnection,
  dispatch,
  isLoading,
}: StatusEventsAndActionsDialogProps) => {
  const classes = useStyles();
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
        className={classes.closeButton}
        onClick={close}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent className={classes.dialogContent}>
        <SimpleTabs
          tabNames={['Next status events', 'Status actions']}
          tabPanelPadding={theme.spacing(0, 3)}
        >
          <AddStatusChangingEventsToConnection
            statusChangingEvents={
              workflowConnection?.statusChangingEvents?.map(
                (statusChangingEvent) => statusChangingEvent.statusChangingEvent
              ) as ProposalEvent[]
            }
            statusName={workflowConnection?.proposalStatus.name}
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
            statusName={workflowConnection?.proposalStatus.name}
            isLoading={isLoading}
          />
        </SimpleTabs>
      </DialogContent>
    </Dialog>
  );
};

export default StatusEventsAndActionsDialog;
