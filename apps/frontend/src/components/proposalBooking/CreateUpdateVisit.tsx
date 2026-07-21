import { Button, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import React, { useContext, useState } from 'react';
import * as Yup from 'yup';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import ErrorMessage from 'components/common/ErrorMessage';
import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import UserManagementTable from 'components/common/UserManagementTable';
import { FeatureContext } from 'context/FeatureContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { BasicUserDetails, FeatureId, Invite } from 'generated/sdk';
import { UserExperiment } from 'hooks/experiment/useUserExperiments';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import withConfirm, { WithConfirmProps } from 'utils/withConfirm';

interface CreateUpdateVisitProps {
  event: UserExperiment;
  close: (updatedEvent: UserExperiment) => void;
  readonly: boolean; // prop is required here for the Visit modal specifically, although optional for the more generic PeopleSelectorModal
}

function CreateUpdateVisit({
  event,
  close,
  readonly,
  confirm,
}: CreateUpdateVisitProps & WithConfirmProps) {
  const { user } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const [visitInvites, setVisitInvites] = useState<Invite[]>(
    event.visit?.registrationInvites || []
  );

  const { visit } = event;

  const initialValues = {
    team: visit?.registrations.map((registration) => registration.user!) || [],
    teamLeadUserId: visit?.teamLead.id || null,
    inviteEmails: visit?.registrationInvites || [],
  };

  const featureContext = useContext(FeatureContext);
  const allowInviteByEmail = !!featureContext.featuresMap.get(
    FeatureId.EMAIL_INVITE
  )?.isEnabled;

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
        inviteEmails: Yup.array().default([]),
      })}
      onSubmit={async (values): Promise<void> => {
        if (visit) {
          const afterConfirm = () => {
            api({ toastSuccessMessage: 'Visit updated' })
              .updateVisit({
                visitId: visit.id,
                team: values.team.map((user) => user.id),
                teamLeadUserId: values.teamLeadUserId,
                inviteEmails: visitInvites.map((invite) => invite.email),
              })
              .then(({ updateVisit }) => {
                if (updateVisit) {
                  close({ ...event, visit: updateVisit });
                }
              });
          };

          const teamLeadChanged = () => {
            return (
              user.id === visit.teamLead.id &&
              values.teamLeadUserId !== visit.teamLead.id
            );
          };

          if (teamLeadChanged()) {
            confirm(
              async () => {
                afterConfirm();
              },
              {
                title: 'Please Confirm',
                description:
                  'Changing the Team Lead means you will no longer be the team lead. Only the PI and Team Lead can change the visitor list.',
              }
            )();
          } else {
            afterConfirm();
          }
        } else {
          api({ toastSuccessMessage: 'Visit created' })
            .createVisit({
              experimentPk: event.experimentPk,
              team: values.team?.map((user) => user.id),
              teamLeadUserId: values.teamLeadUserId as number,
            })
            .then(({ createVisit }) => {
              if (createVisit) {
                close({ ...event, visit: createVisit });
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
          <UserManagementTable
            title="Visitors"
            addModalTitle={readonly ? 'View Visitors' : 'Edit Visitors'}
            readonly={readonly}
            setInvites={setVisitInvites}
            invites={visitInvites}
            setUsers={(team: BasicUserDetails[]) => {
              setFieldValue('team', team);
            }}
            users={values.team || []}
            allowInviteByEmail={allowInviteByEmail}
          />
          <ErrorMessage name="team" />

          <FormikUIAutocomplete
            items={values.team.map((user) => ({
              text: getFullUserName(user),
              value: user.id,
            }))}
            label="Team lead"
            name="teamLeadUserId"
            disabled={readonly}
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
              disabled={isSubmitting || readonly}
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

export default withConfirm(CreateUpdateVisit);
