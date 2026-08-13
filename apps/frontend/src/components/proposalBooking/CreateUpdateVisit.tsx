import { Box, Button, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import React, { useContext, useState } from 'react';
import * as Yup from 'yup';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import ErrorMessage from 'components/common/ErrorMessage';
import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import MobileActionBar from 'components/common/mobile/MobileActionBar';
import MobileAppBar from 'components/common/mobile/MobileAppBar';
import UserManagementTable from 'components/common/UserManagementTable';
import { FeatureContext } from 'context/FeatureContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { BasicUserDetails, FeatureId, Invite } from 'generated/sdk';
import { useIsMobile } from 'hooks/common/useResponsive';
import { UserExperiment } from 'hooks/experiment/useUserExperiments';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import withConfirm, { WithConfirmProps } from 'utils/withConfirm';

interface CreateUpdateVisitProps {
  event: UserExperiment;
  close: (updatedEvent: UserExperiment) => void;
}

function CreateUpdateVisit({
  event,
  close,
  confirm,
}: CreateUpdateVisitProps & WithConfirmProps) {
  const { user } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const isMobile = useIsMobile();
  const [visitInvites, setVisitInvites] = useState<Invite[]>(
    event.visit?.registrationInvites || []
  );

  const { visit } = event;

  // editing an existing visit needs write rights; creating one needs create rights
  const readonly = visit
    ? !event.visitPerms.writeable
    : !event.visitPerms.createable;

  const initialValues = {
    team: visit?.registrations.map((registration) => registration.user!) || [],
    teamLeadUserId: visit?.teamLead?.id || null,
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
              user.id === visit.teamLead?.id &&
              values.teamLeadUserId !== visit.teamLead?.id
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
      {({ values, isSubmitting, setFieldValue, submitForm }) => {
        const heading = visit ? 'Update the visit' : 'Create new visit';
        const fields = (
          <>
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
          </>
        );

        return (
          <Form
            style={
              isMobile
                ? {
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100%',
                  }
                : undefined
            }
          >
            {isMobile ? (
              <MobileAppBar
                title={heading}
                variant="dialog"
                onBack={() => close(event)}
              />
            ) : (
              <Typography variant="h6">{heading}</Typography>
            )}
            {isMobile ? (
              <Box
                sx={{
                  paddingX: 2,
                  paddingY: 2,
                  flex: 1,
                  backgroundColor: 'background.default',
                }}
              >
                {fields}
              </Box>
            ) : (
              fields
            )}
            {isMobile ? (
              <Box sx={{ paddingX: 2 }}>
                <MobileActionBar
                  primary={{
                    label: visit ? 'Update' : 'Create',
                    onClick: submitForm,
                    disabled: isSubmitting,
                  }}
                  isLoading={isSubmitting}
                />
              </Box>
            ) : (
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
            )}
          </Form>
        );
      }}
    </Formik>
  );
}

export default withConfirm(CreateUpdateVisit);
