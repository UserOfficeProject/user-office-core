import MaterialTable from '@material-table/core';
import makeStyles from '@mui/styles/makeStyles';
import i18n from 'i18n';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useCheckAccess } from 'components/common/Can';
import { BasicUserDetails, UserRole, ReviewMeeting } from 'generated/sdk';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

// NOTE: Some custom styles for row expand table.
const useStyles = makeStyles(() => ({
  root: {
    '& tr:last-child td': {
      border: 'none',
    },
    '& .MuiPaper-root': {
      padding: '0 40px',
      backgroundColor: '#fafafa',
    },
  },
}));

type AssignedParticipantsTableProps = {
  reviewMeeting: ReviewMeeting;
  removeAssignedParticipants: (
    participantId: number,
    reviewMeetingId: number
  ) => void;
};

const assignmentColumns = [
  {
    title: 'Name',
    field: 'firstname',
  },
  {
    title: 'Surname',
    field: 'lastname',
  },
  {
    title: 'Organisation',
    field: 'organisation',
  },
];

const AssignedParticipantsTable = ({
  reviewMeeting,
  removeAssignedParticipants,
}: AssignedParticipantsTableProps) => {
  const classes = useStyles();
  const { api } = useDataApiWithFeedback();
  const { t } = useTranslation();

  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const removeAssignedParticipantsHandle = async (participantId: number) => {
    await api({
      toastSuccessMessage: 'Particpant removed from call review meeting!',
    }).removeUserFromReviewMeeting({
      reviewMeetingId: reviewMeeting.id,
      userId: participantId,
    });

    removeAssignedParticipants(participantId, reviewMeeting.id);
  };

  return (
    <div
      className={classes.root}
      data-cy="team-review-meeting-participants-assignments-table"
    >
      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={`Assigned ${i18n.format(t('call review meeting'), 'plural')}`}
        data={reviewMeeting.participants}
        editable={
          isUserOfficer
            ? {
                onRowDelete: (
                  rowAssignmentsData: BasicUserDetails
                ): Promise<void> =>
                  removeAssignedParticipantsHandle(rowAssignmentsData.id),
              }
            : {}
        }
        options={{
          search: false,
          paging: false,
          toolbar: false,
          headerStyle: { backgroundColor: '#fafafa' },
        }}
      />
    </div>
  );
};

AssignedParticipantsTable.propTypes = {
  reviewMeeting: PropTypes.object.isRequired,
  removeAssignedParticipants: PropTypes.func.isRequired,
};

export default AssignedParticipantsTable;
