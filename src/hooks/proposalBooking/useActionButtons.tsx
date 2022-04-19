import { Action } from '@material-table/core';
import FeedbackIcon from '@mui/icons-material/Feedback';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import { DateTime } from 'luxon';
import React, { ReactNode, useContext } from 'react';
import { useHistory } from 'react-router';

import BoxIcon from 'components/common/icons/BoxIcon';
import EsiIcon from 'components/common/icons/EsiIcon';
import ActionButton, {
  ActionButtonState,
} from 'components/proposalBooking/ActionButton';
import CreateUpdateVisit from 'components/proposalBooking/CreateUpdateVisit';
import CreateUpdateVisitRegistration from 'components/visit/CreateUpdateVisitRegistration';
import { UserContext, BasicUser } from 'context/UserContextProvider';
import {
  FeedbackStatus,
  ProposalBookingStatusCore,
  ProposalEndStatus,
} from 'generated/sdk';

import { ProposalScheduledEvent } from './useProposalBookingsScheduledEvents';

const getParticipationRole = (
  user: BasicUser,
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

const isPiOrCoProposer = (user: BasicUser, event: ProposalScheduledEvent) => {
  const role = getParticipationRole(user, event);

  return role === 'PI' || role === 'co-proposer';
};

const isTeamlead = (user: BasicUser, event: ProposalScheduledEvent) =>
  event.visit && event.visit.teamLead.id === user.id;

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
    let stateReason: string | null = null;

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
        stateReason =
          'This action is disabled because proposal is not accepted or missing management decision';
      }
    } else {
      buttonState = 'invisible';
    }

    return createActionButton(
      `Define who is coming ${stateReason ? '(' + stateReason + ')' : ''}`,
      <GroupIcon data-cy="define-visit-icon" />,
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

  const finishEsi = (event: ProposalScheduledEvent) => {
    let buttonState: ActionButtonState;
    let stateReason: string | null = null;

    if (isPiOrCoProposer(user, event)) {
      if (
        event.proposal.finalStatus === ProposalEndStatus.ACCEPTED &&
        event.proposal.managementDecisionSubmitted
      ) {
        if (event.esi?.isSubmitted) {
          buttonState = 'completed';
        } else {
          buttonState = 'active';
        }
      } else {
        buttonState = 'inactive';
        stateReason =
          'This action is disabled because proposal is not accepted or missing management decision';
      }
    } else {
      buttonState = 'invisible';
    }

    return createActionButton(
      `Finish safety input form ${stateReason ? '(' + stateReason + ')' : ''}`,
      <EsiIcon data-cy="finish-safety-input-form-icon" />,
      buttonState,
      () => {
        if (event?.esi) {
          history.push(`/UpdateEsi/${event.esi.id}`);
        } else {
          history.push(`/CreateEsi/${event.id}`);
        }
      }
    );
  };

  const registerVisitAction = (event: ProposalScheduledEvent) => {
    let buttonState: ActionButtonState;
    let stateReason: string | null = null;

    if (event.visit !== null) {
      const registration = event.visit.registrations.find(
        (registration) => registration.userId === user.id
      );
      if (!registration) {
        buttonState = 'invisible';
      } else {
        if (registration.isRegistrationSubmitted) {
          buttonState = 'completed';
        } else {
          buttonState = 'active';
        }
      }
    } else {
      buttonState = 'inactive';
      stateReason = 'This action is disabled because visit is not defined';
    }

    return createActionButton(
      `Define your own visit ${stateReason ? '(' + stateReason + ')' : ''}`,
      <FlightTakeoffIcon data-cy="register-visit-icon" />,
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
    let stateReason: string | null = null;

    if (event.visit !== null) {
      const registration = event.visit.registrations.find(
        (reg) => reg.userId === user.id
      );
      if (registration) {
        const trainingExpiryDate: string | null =
          registration.trainingExpiryDate || null;

        if (
          trainingExpiryDate &&
          DateTime.fromISO(trainingExpiryDate) >
            DateTime.fromISO(event.startsAt)
        ) {
          buttonState = 'completed';
        } else {
          buttonState = 'active';
        }
      } else {
        buttonState = 'invisible';
      }
    } else {
      buttonState = 'inactive';
      stateReason = 'This action is disabled because visit is not defined';
    }

    return createActionButton(
      `Finish individual training ${
        stateReason ? '(' + stateReason + ')' : ''
      }`,
      <SchoolIcon data-cy="finish-training-icon" />,
      buttonState,
      () => {
        history.push('/training');
      }
    );
  };

  const declareShipmentAction = (event: ProposalScheduledEvent) => {
    let buttonState: ActionButtonState;

    if (
      event.proposal.finalStatus === ProposalEndStatus.ACCEPTED &&
      event.proposal.managementDecisionSubmitted
    ) {
      buttonState = 'neutral';
    } else {
      buttonState = 'inactive';
    }

    return createActionButton(
      'Declare shipment(s)',
      <BoxIcon data-cy="declare-shipment-icon" />,
      buttonState,
      () => {
        history.push(`/DeclareShipments/${event.id}`);
      }
    );
  };

  const giveFeedback = (event: ProposalScheduledEvent) => {
    let buttonState: ActionButtonState;

    if (isTeamlead(user, event)) {
      if (event.status === ProposalBookingStatusCore.COMPLETED) {
        if (event.feedback?.status === FeedbackStatus.SUBMITTED) {
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
      'Provide feedback',
      <FeedbackIcon data-cy="provide-feedback-icon" />,
      buttonState,
      () => {
        if (event?.feedback) {
          history.push(`/UpdateFeedback/${event.feedback.id}`);
        } else {
          history.push(`/CreateFeedback/${event.id}`);
        }
      }
    );
  };

  return {
    formTeamAction,
    finishEsi,
    registerVisitAction,
    individualTrainingAction,
    declareShipmentAction,
    giveFeedback,
  };
}
