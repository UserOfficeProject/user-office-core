import AssignmentInd from '@mui/icons-material/AssignmentInd';
import Email from '@mui/icons-material/Email';
import { Typography } from '@mui/material';
import i18n from 'i18n';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import ParticipantModal from 'components/proposal/ParticipantModal';
import ActionButton from 'components/proposalBooking/ActionButton';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useReviewMeetingsData } from 'hooks/reviewMeeting/useReviewMeetingsData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import {
  BasicUserDetails,
  EmailStatusActionEmailTemplate,
  ReviewMeetingFragment,
  UserRole,
} from '../../generated/sdk';
import AssignedParticipantsTable from './AssignedParticipantsTable';
import CreateUpdateReviewMeeting from './CreateUpdateReviewMeeting';
import NotifyModal from './NotifyModal';

const ReviewMeetingsTable = () => {
  const { timezone, toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });

  const columns = [
    {
      title: 'Name',
      field: 'name',
    },
    {
      title: 'Details',
      field: 'details',
    },
    {
      title: 'Instrument',
      field: 'instrument.name',
    },
    {
      title: 'Created by',
      field: 'formattedCreator',
    },
    {
      title: `Occurs at (${timezone})`,
      field: 'formattedOccursAt',
      emptyValue: '-',
    },
  ];

  const {
    loadingReviewMeetings,
    reviewMeetings,
    setReviewMeetingsWithLoading,
  } = useReviewMeetingsData();

  const { api } = useDataApiWithFeedback();
  const { t } = useTranslation();
  const [assigningReviewMeetingId, setAssigningReviewMeetingId] = useState<
    number | null
  >(null);
  const [selectedRow, setSelectedRow] = useState<ReviewMeetingFragment | null>(
    null
  );

  const [urlQueryParams, setUrlQueryParams] =
    useQueryParams<UrlQueryParamsType>(DefaultQueryParams);

  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const onReviewMeetingDelete = async (reviewMeetingId: number | string) => {
    try {
      await api({
        toastSuccessMessage:
          t('Call review meeting') + ' removed successfully!',
      }).deleteReviewMeeting({
        reviewMeetingId: reviewMeetingId as number,
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const assignParticipants = async (participants: BasicUserDetails[]) => {
    await api({
      toastSuccessMessage: `Participant assigned to ${i18n.format(
        t('call review meeting'),
        'lowercase'
      )} successfully!`,
    }).assignUsersToReviewMeeting({
      reviewMeetingId: assigningReviewMeetingId as number,
      usersIds: participants.map((scientist) => scientist.id),
    });
    participants = participants.map((participant) => {
      if (!participant.organisation) {
        participant.organisation = 'Other';
      }

      return participant;
    });
    setReviewMeetingsWithLoading((reviewMeeting) =>
      reviewMeeting.map((meeting) => {
        if (meeting.id === assigningReviewMeetingId) {
          return {
            ...meeting,
            participants: [...meeting.participants, ...participants],
          };
        } else {
          return meeting;
        }
      })
    );
    setAssigningReviewMeetingId(null);
  };

  const AssignmentIndIcon = (): JSX.Element => <AssignmentInd />;
  const NotifyIcon = (notified: boolean): JSX.Element => {
    return (
      <ActionButton variant={notified ? 'completed' : 'neutral'}>
        <Email />
      </ActionButton>
    );
  };

  const AssignedParticipants = React.useCallback(
    ({ rowData }) => {
      const removeAssignedParticipants = (
        participantToRemoveId: number,
        meetingToRemoveFromId: number
      ) => {
        setReviewMeetingsWithLoading((meetings) =>
          meetings.map((meeting) => {
            if (meeting.id === meetingToRemoveFromId) {
              const newParticipants = meeting.participants.filter(
                (participant) => participant.id !== participantToRemoveId
              );

              return {
                ...meeting,
                participants: newParticipants,
              };
            } else {
              return meeting;
            }
          })
        );
        setAssigningReviewMeetingId(null);
      };

      return (
        <AssignedParticipantsTable
          reviewMeeting={rowData}
          removeAssignedParticipants={removeAssignedParticipants}
        />
      );
    },
    [setReviewMeetingsWithLoading, setAssigningReviewMeetingId]
  );

  const notifyReviewMeetingParticipants = async (
    reviewMeeting: ReviewMeetingFragment,
    selectedTemplate: EmailStatusActionEmailTemplate
  ) => {
    await api({
      toastSuccessMessage:
        'Notification to meeting participants sent successfully',
    }).notifyReviewMeeting({
      reviewMeetingId: reviewMeeting!.id,
      templateId: selectedTemplate!.id,
    });

    setReviewMeetingsWithLoading((meetings) =>
      meetings.map((meeting) => {
        if (meeting.id === reviewMeeting!.id) {
          return {
            ...meeting,
            notified: true,
          };
        } else {
          return meeting;
        }
      })
    );

    setSelectedRow(null);
  };

  const createModal = (
    onUpdate: FunctionType<void, [ReviewMeetingFragment | null]>,
    onCreate: FunctionType<void, [ReviewMeetingFragment | null]>,
    editReviewMeeting: ReviewMeetingFragment | null
  ) => (
    <CreateUpdateReviewMeeting
      reviewMeeting={editReviewMeeting}
      close={(meeting: ReviewMeetingFragment | null) =>
        !!editReviewMeeting ? onUpdate(meeting) : onCreate(meeting)
      }
    />
  );

  const meetingAssignments = reviewMeetings?.find(
    (meeting) => meeting.id === assigningReviewMeetingId
  );

  const meetingsWithFormattedData = reviewMeetings.map((meeting) => ({
    ...meeting,
    formattedOccursAt: toFormattedDateTime(meeting.occursAt),
    formattedCreator: `${meeting.creator.firstname} ${meeting.creator.lastname}`,
  }));

  return (
    <>
      <NotifyModal
        reviewMeeting={selectedRow as ReviewMeetingFragment}
        handleNotify={notifyReviewMeetingParticipants}
        show={!!selectedRow}
        close={() => setSelectedRow(null)}
      />
      <ParticipantModal
        show={!!assigningReviewMeetingId}
        close={(): void => setAssigningReviewMeetingId(null)}
        addParticipants={assignParticipants}
        selectedUsers={meetingAssignments?.participants.map(
          (scientist) => scientist.id
        )}
        selection={true}
        title={'Call review meeting participants'}
      />
      <div data-cy="team-table">
        <SuperMaterialTable
          delete={onReviewMeetingDelete}
          setData={setReviewMeetingsWithLoading}
          hasAccess={{
            create: isUserOfficer,
            update: isUserOfficer,
            remove: isUserOfficer,
          }}
          title={
            <Typography variant="h6" component="h2">
              Call review meetings
            </Typography>
          }
          columns={columns}
          data={meetingsWithFormattedData}
          isLoading={loadingReviewMeetings}
          createModal={createModal}
          detailPanel={[
            {
              tooltip: 'Show participants',
              render: AssignedParticipants,
            },
          ]}
          options={{
            search: true,
            debounceInterval: 400,
          }}
          actions={
            isUserOfficer
              ? [
                  {
                    icon: AssignmentIndIcon,
                    tooltip: 'Assign participant',
                    onClick: (_event: unknown, rowData: unknown): void =>
                      setAssigningReviewMeetingId(
                        (rowData as ReviewMeetingFragment).id
                      ),
                  },
                  (rowData) => ({
                    icon: () => NotifyIcon(rowData.notified),
                    tooltip: rowData.notified
                      ? 'Already notified, notify again'
                      : 'Notify participant',
                    onClick: (_event: unknown, rowData: unknown): void => {
                      setSelectedRow(rowData as ReviewMeetingFragment);
                    },
                  }),
                ]
              : []
          }
          urlQueryParams={urlQueryParams}
          setUrlQueryParams={setUrlQueryParams}
        />
      </div>
    </>
  );
};

export default ReviewMeetingsTable;
