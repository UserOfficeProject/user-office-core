import { Action } from '@material-table/core';
import FeedbackIcon from '@mui/icons-material/Feedback';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import GroupIcon from '@mui/icons-material/Group';
import React, { ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import BoxIcon from 'components/common/icons/BoxIcon';
import EsiIcon from 'components/common/icons/EsiIcon';
import ActionButton, {
  ActionButtonState,
} from 'components/proposalBooking/ActionButton';
import CreateUpdateVisit from 'components/proposalBooking/CreateUpdateVisit';
import CreateUpdateCancelVisitRegistration from 'components/visit/CreateUpdateCancelVisitRegistration';
import { UserContext } from 'context/UserContextProvider';
import {
  FeedbackStatus,
  ProposalEndStatus,
  UserJwt,
  VisitRegistrationStatus,
} from 'generated/sdk';
import { UserExperiment } from 'hooks/experiment/useUserExperiments';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const getParticipationRole = (
  user: UserJwt,
  event: UserExperiment
): 'PI' | 'co-proposer' | 'visitor' | null => {
  if (event.proposal?.proposer?.id === user.id) {
    return 'PI';
  } else if (event.proposal?.users.map((user) => user.id).includes(user.id)) {
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

const isPiOrCoProposer = (user: UserJwt, event: UserExperiment) => {
  const role = getParticipationRole(user, event);

  return role === 'PI' || role === 'co-proposer';
};

const isTeamlead = (user: UserJwt, event: UserExperiment) =>
  event.visit && event.visit.teamLead.id === user.id;

const createActionButton = (
  tooltip: string,
  icon: JSX.Element,
  state: ActionButtonState,
  onClick: () => void | undefined
): Action<UserExperiment> => ({
  tooltip,
  icon: () => <ActionButton variant={state}>{icon}</ActionButton>,
  hidden: state === 'invisible',
  onClick: ['completed', 'active', 'neutral', 'pending'].includes(state)
    ? onClick
    : () => {},
});

interface UseActionButtonsArgs {
  openModal: (contents: ReactNode) => void;
  closeModal: () => void;
  eventUpdated: (updatedEvent: UserExperiment) => void;
}
export function useActionButtons(args: UseActionButtonsArgs) {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const { openModal, closeModal, eventUpdated } = args;

  const formTeamAction = (event: UserExperiment) => {
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

  // TODO: This flow should be reworked completely
  const finishEsi = (event: UserExperiment) => {
    let buttonState: ActionButtonState;
    let stateReason: string | null = null;
    if (isPiOrCoProposer(user, event)) {
      if (
        event.proposal.finalStatus === ProposalEndStatus.ACCEPTED &&
        event.proposal.managementDecisionSubmitted
      ) {
        if (
          event.experimentSafety &&
          event.experimentSafety.esiQuestionarySubmittedAt
        ) {
          // TODO: This needs to be worked on. There is no is_submitted field unlike in experiment_safety_input. Instead we have status field in the new experiment_safety table. The status is not finalized yet. We will work on it, when we get in here
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
      `Finish experiment safety form ${stateReason ? '(' + stateReason + ')' : ''}`,
      <EsiIcon data-cy="finish-experiment-safety-form-icon" />,
      buttonState,
      () => {
        if (event.experimentSafety) {
          // If experiment safety already exists, navigate directly
          navigate(
            `/ExperimentSafety/${event.experimentSafety.experimentSafetyPk}`
          );
        } else {
          // Create experiment safety first, then navigate
          api()
            .createExperimentSafety({ experimentPk: event.experimentPk })
            .then((result) => {
              if (result.createExperimentSafety) {
                navigate(
                  `/ExperimentSafety/${result.createExperimentSafety.experimentSafetyPk}`
                );
              }
            });
        }
      }
    );
  };

  const registerVisitAction = (event: UserExperiment) => {
    let buttonState: ActionButtonState;
    let stateReason: string | null = null;

    if (event.visit !== null) {
      const registration = event.visit.registrations.find(
        (registration) => registration.userId === user.id
      );
      if (!registration) {
        buttonState = 'invisible';
      } else {
        switch (registration.status) {
          case VisitRegistrationStatus.DRAFTED:
            buttonState = 'active';
            break;
          case VisitRegistrationStatus.CHANGE_REQUESTED:
            buttonState = 'active';
            stateReason = 'Changes are requested for your registration';
            break;
          case VisitRegistrationStatus.SUBMITTED:
            buttonState = 'pending';
            stateReason = 'The registration is pending approval';
            break;
          case VisitRegistrationStatus.APPROVED:
            buttonState = 'completed';
            break;
          case VisitRegistrationStatus.CANCELLED_BY_USER:
          case VisitRegistrationStatus.CANCELLED_BY_FACILITY:
            buttonState = 'cancelled';
            stateReason =
              'This action is disabled because your registration for visit is cancelled';
            break;
        }
      }
    } else {
      buttonState = 'inactive';
      stateReason = 'This action is disabled because visit is not defined';
    }

    return createActionButton(
      `Define your visit ${stateReason ? '(' + stateReason + ')' : ''}`,
      <FlightTakeoffIcon data-cy="register-visit-icon" />,
      buttonState,
      () => {
        openModal(
          <CreateUpdateCancelVisitRegistration
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
            onCancelled={(cancelledRegistration) => {
              const updatedRegistrations = event.visit!.registrations.map(
                (registration) =>
                  registration.userId === cancelledRegistration.userId
                    ? cancelledRegistration
                    : registration
              );
              eventUpdated({
                ...event,
                visit: { ...event.visit!, registrations: updatedRegistrations },
              });
              closeModal();
            }}
            onClose={closeModal}
          />
        );
      }
    );
  };

  const declareShipmentAction = (event: UserExperiment) => {
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
        navigate(`/DeclareShipments/${event.experimentPk}`);
      }
    );
  };

  const giveFeedback = (event: UserExperiment) => {
    let buttonState: ActionButtonState;

    if (isTeamlead(user, event)) {
      if (event.status === 'COMPLETED') {
        //todo: Needs to be changed to ExperimentStatus.COMPLETED
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
          navigate(`/CreateFeedback/${event.experimentPk}`);
        }
      }
    );
  };

  return {
    formTeamAction,
    finishEsi,
    registerVisitAction,
    declareShipmentAction,
    giveFeedback,
  };
}
