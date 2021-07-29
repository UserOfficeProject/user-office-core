import FlightTakeoffIcon from '@material-ui/icons/FlightTakeoff';
import GroupIcon from '@material-ui/icons/Group';
import SchoolIcon from '@material-ui/icons/School';
import { Action } from 'material-table';
import moment from 'moment';
import React, { ReactNode, useContext } from 'react';
import { useHistory } from 'react-router';

import BoxIcon from 'components/common/icons/BoxIcon';
import ActionButton, {
  ActionButtonState,
} from 'components/proposalBooking/ActionButton';
import CreateUpdateVisit from 'components/proposalBooking/CreateUpdateVisit';
import CreateUpdateShipment from 'components/shipments/CreateUpdateShipment';
import CreateUpdateVisitRegistration from 'components/visit/CreateUpdateVisitRegistration';
import { UserContext } from 'context/UserContextProvider';
import { ProposalEndStatus } from 'generated/sdk';
import { User } from 'models/User';
import { parseTzLessDateTime } from 'utils/Time';

import { ProposalScheduledEvent } from './useProposalBookingsScheduledEvents';

const getParticipationRole = (
  user: User,
  event: ProposalScheduledEvent
): 'PI' | 'co-proposer' | 'visitor' | null => {
  if (event.proposal.proposer?.id === user.id) {
    return 'PI';
  } else if (event.proposal.users.map((user) => user.id).includes(user.id)) {
    return 'co-proposer';
  } else if (
    event.visit?.registrations
      .map((registration) => registration.userId)
      .includes(user.id)
  ) {
    return 'visitor';
  } else {
    return null;
  }
};

const isPiOrCoProposer = (user: User, event: ProposalScheduledEvent) => {
  const role = getParticipationRole(user, event);

  return role === 'PI' || role === 'co-proposer';
};

const createActionButton = (
  tooltip: string,
  icon: JSX.Element,
  state: ActionButtonState,
  onClick: () => void | undefined
): Action<ProposalScheduledEvent> => ({
  tooltip,
  // eslint-disable-next-line
  icon: () => <ActionButton variant={state}>{icon}</ActionButton>,
  hidden: state === 'invisible',
  disabled: state === 'inactive',
  onClick: ['completed', 'active', 'neutral'].includes(state)
    ? onClick
    : () => {},
});

interface UseActionButtonsArgs {
  openModal: (contents: ReactNode) => void;
  closeModal: () => void;
  eventUpdated: (updatedEvent: ProposalScheduledEvent) => void;
}
export function useActionButtons(args: UseActionButtonsArgs) {
  const history = useHistory();
  const { user } = useContext(UserContext);
  const { openModal, closeModal, eventUpdated } = args;

  const formTeamAction = (event: ProposalScheduledEvent) => {
    let buttonState: ActionButtonState;

    if (isPiOrCoProposer(user, event)) {
      if (
        event.proposal.finalStatus === ProposalEndStatus.ACCEPTED &&
        event.proposal.managementDecisionSubmitted
      ) {
        if (event.visit !== null) {
          buttonState = 'completed';
        } else {
          buttonState = 'active';
        }
      } else {
        buttonState = 'inactive';
      }
    } else {
      buttonState = 'invisible';
    }

    return createActionButton(
      'Define who is coming',
      <GroupIcon />,
      buttonState,
      () => {
        openModal(
          <CreateUpdateVisit
            event={event}
            close={(updatedEvent) => {
              eventUpdated(updatedEvent);
              closeModal();
            }}
          />
        );
      }
    );
  };

  const registerVisitAction = (event: ProposalScheduledEvent) => {
    let buttonState: ActionButtonState;

    if (event.visit !== null) {
      const userVisit = event.visit.registrations.find(
        (registration) => registration.userId === user.id
      );
      if (!userVisit) {
        buttonState = 'invisible';
      } else {
        if (userVisit.isRegistrationSubmitted) {
          buttonState = 'completed';
        } else {
          buttonState = 'active';
        }
      }
    } else {
      buttonState = 'inactive';
    }

    return createActionButton(
      'Define your own visit',
      <FlightTakeoffIcon />,
      buttonState,
      () => {
        openModal(
          <CreateUpdateVisitRegistration
            registration={
              event.visit!.registrations.find(
                (registration) => registration.userId === user.id
              )!
            }
            onSubmitted={(updatedRegistration) => {
              const updatedRegistrations = event.visit!.registrations.map(
                (registration) =>
                  registration.userId === updatedRegistration.userId
                    ? updatedRegistration
                    : registration
              );
              eventUpdated({
                ...event,
                visit: { ...event.visit!, registrations: updatedRegistrations },
              });
              closeModal();
            }}
          />
        );
      }
    );
  };

  const individualTrainingAction = (event: ProposalScheduledEvent) => {
    let buttonState: ActionButtonState;

    if (event.visit !== null) {
      const registration = event.visit.registrations.find(
        (reg) => reg.userId === user.id
      );
      const trainingExpiryDate: Date | null =
        registration?.trainingExpiryDate || null;

      if (moment(trainingExpiryDate) > parseTzLessDateTime(event.startsAt)) {
        buttonState = 'completed';
      } else {
        buttonState = 'active';
      }
    } else {
      buttonState = 'inactive';
    }

    return createActionButton(
      'Finish individual training',
      <SchoolIcon />,
      buttonState,
      () => {
        history.push('/training');
      }
    );
  };

  const declareShipmentAction = (event: ProposalScheduledEvent) => {
    let buttonState: ActionButtonState;

    if (isPiOrCoProposer(user, event)) {
      if (event.visit !== null) {
        if (event.visit.shipments.length > 0) {
          buttonState = 'completed';
        } else {
          buttonState = 'neutral';
        }
      } else {
        buttonState = 'inactive';
      }
    } else {
      buttonState = 'invisible';
    }

    return createActionButton(
      'Declare shipment(s)',
      <BoxIcon />,
      buttonState,
      () => {
        openModal(
          <CreateUpdateShipment
            visit={event.visit!}
            onShipmentSubmitted={(shipment) => {
              eventUpdated({
                ...event,
                visit: {
                  ...event.visit!,
                  shipments: shipment ? [shipment] : [],
                },
              });
            }}
          />
        );
      }
    );
  };

  return {
    formTeamAction,
    registerVisitAction,
    individualTrainingAction,
    declareShipmentAction,
  };
}
