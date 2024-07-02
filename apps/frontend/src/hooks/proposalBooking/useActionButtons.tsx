import { Action } from '@material-table/core';
import FeedbackIcon from '@mui/icons-material/Feedback';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import { DateTime } from 'luxon';
import React, { ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import BoxIcon from 'components/common/icons/BoxIcon';
import EsiIcon from 'components/common/icons/EsiIcon';
import ActionButton, {
  ActionButtonState,
} from 'components/proposalBooking/ActionButton';
import CreateUpdateVisit from 'components/proposalBooking/CreateUpdateVisit';
import CreateUpdateVisitRegistration from 'components/visit/CreateUpdateVisitRegistration';
import { UserContext } from 'context/UserContextProvider';
import {
  FeedbackStatus,
  ProposalBookingStatusCore,
  ProposalEndStatus,
  UserJwt,
} from 'generated/sdk';

import { ProposalScheduledEvent } from './useProposalBookingsScheduledEvents';

const getParticipationRole = (
  user: UserJwt,
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

const isPiOrCoProposer = (user: UserJwt, event: ProposalScheduledEvent) => {
  const role = getParticipationRole(user, event);

  return role === 'PI' || role === 'co-proposer';
};

const isTeamlead = (user: UserJwt, event: ProposalScheduledEvent) =>
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
  const navigate = useNavigate();
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
          navigate(`/UpdateEsi/${event.esi.id}`);
        } else {
          navigate(`/CreateEsi/${event.id}`);
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
        navigate('/training');
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
        navigate(`/DeclareShipments/${event.id}`);
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
          navigate(`/UpdateFeedback/${event.feedback.id}`);
        } else {
          navigate(`/CreateFeedback/${event.id}`);
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
