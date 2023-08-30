import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import makeStyles from '@mui/styles/makeStyles';
import useTheme from '@mui/styles/useTheme';
import React, { Dispatch, SetStateAction } from 'react';

import SimpleTabs from 'components/common/TabPanel';
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
}));

type StatusEventsAndActionsDialogProps = {
  workflowConnection: ProposalWorkflowConnection | null;
  setWorkflowConnection: Dispatch<
    SetStateAction<ProposalWorkflowConnection | null>
  >;
  dispatch: Dispatch<Event>;
};

const StatusEventsAndActionsDialog = ({
  workflowConnection,
  setWorkflowConnection,
  dispatch,
}: StatusEventsAndActionsDialogProps) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Dialog
      maxWidth="lg"
      fullWidth
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={!!workflowConnection}
      onClose={(): void => setWorkflowConnection(null)}
      data-cy="status-changing-events-modal"
    >
      <DialogTitle>Status events and actions</DialogTitle>
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
          />
        </SimpleTabs>
      </DialogContent>
    </Dialog>
  );
};

export default StatusEventsAndActionsDialog;
