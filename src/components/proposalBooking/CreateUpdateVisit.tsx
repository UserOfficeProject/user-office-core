import { Button, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import ErrorMessage from 'components/common/ErrorMessage';
import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import Participants from 'components/proposal/ProposalParticipants';
import { BasicUserDetails } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';

import { ProposalScheduledEvent } from '../../hooks/proposalBooking/useProposalBookingsScheduledEvents';

interface CreateUpdateVisitProps {
  event: ProposalScheduledEvent;
  close: (updatedEvent: ProposalScheduledEvent) => void;
}
function CreateUpdateVisit({ event, close }: CreateUpdateVisitProps) {
  const { api } = useDataApiWithFeedback();

  const visit = event.visit;

  const initialValues = {
    team: visit?.registrations.map((registration) => registration.user) || [],
    teamLeadUserId: visit?.teamLead.id || null,
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        team: Yup.array()
          .of(Yup.object())
          .required('Please add visitors')
          .min(1, 'Please add visitors'),
        teamLeadUserId: Yup.number()
          .typeError('Please select the team lead')
          .required('Please select the team lead')
          .test({
            message: 'Team lead must be one of the visitors',
            test: function (teamLeadUserId) {
              return this.parent.team
                .map((user: BasicUserDetails) => user.id)
                .includes(teamLeadUserId);
            },
          }),
      })}
      onSubmit={async (values): Promise<void> => {
        if (visit) {
          api({ toastSuccessMessage: 'Visit updated' })
            .updateVisit({
              visitId: visit.id,
              team: values.team.map((user) => user.id),
              teamLeadUserId: values.teamLeadUserId,
            })
            .then(({ updateVisit }) => {
              if (updateVisit.visit) {
                close({ ...event, visit: updateVisit.visit });
              }
            });
        } else {
          api({ toastSuccessMessage: 'Visit created' })
            .createVisit({
              scheduledEventId: event.id,
              team: values.team?.map((user) => user.id),
              teamLeadUserId: values.teamLeadUserId as number,
            })
            .then(({ createVisit }) => {
              if (createVisit.visit) {
                close({ ...event, visit: createVisit.visit });
              }
            });
        }
      }}
    >
      {({ values, isSubmitting, setFieldValue }) => (
        <Form>
          <Typography variant="h6">
            {visit ? 'Update the visit' : 'Create new visit'}
          </Typography>
          <Participants
            title="Visitors"
            setUsers={(team: BasicUserDetails[]) => {
              setFieldValue('team', team);
            }}
            users={values.team || []}
          />
          <ErrorMessage name="team" />

          <FormikUIAutocomplete
            items={values.team.map((user) => ({
              text: getFullUserName(user),
              value: user.id,
            }))}
            label="Team lead"
            name="teamLeadUserId"
            InputProps={{
              'data-cy': 'team-lead-user-dropdown',
              margin: 'dense',
            }}
          />
          <ErrorMessage name="teamLeadUserId" />

          <ActionButtonContainer>
            <Button
              disabled={isSubmitting}
              variant="text"
              onClick={() => close(event)}
            >
              Close
            </Button>
            <Button
              disabled={isSubmitting}
              type="submit"
              data-cy="create-update-visit-button"
            >
              {visit ? 'Update' : 'Create'}
            </Button>
          </ActionButtonContainer>
        </Form>
      )}
    </Formik>
  );
}

export default CreateUpdateVisit;
