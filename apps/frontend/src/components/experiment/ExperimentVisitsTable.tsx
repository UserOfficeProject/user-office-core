import MaterialTable from '@material-table/core';
import { CheckCircleOutline } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, styled, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import CreateUpdateVisitRegistration from 'components/visit/CreateUpdateVisitRegistration';
import VisitStatusIcon from 'components/visit/VisitStatusIcon';
import {
  GetScheduledEventsCoreQuery,
  TrainingStatus,
  VisitRegistrationStatus,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import ButtonWithDialog from 'hooks/common/ButtonWithDialog';
import { useDataApi } from 'hooks/common/useDataApi';
import { tableIcons } from 'utils/materialIcons';
import { getFullUserName } from 'utils/user';
import withConfirm, { WithConfirmProps } from 'utils/withConfirm';

type RowType = NonNullable<
  GetScheduledEventsCoreQuery['scheduledEventsCore'][0]['visit']
>['registrations'][0];

type ScheduledEvent = GetScheduledEventsCoreQuery['scheduledEventsCore'][0];

interface ScheduledEventDetailsTableProps extends WithConfirmProps {
  scheduledEvent: ScheduledEvent;
}

const VisitorName = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

function ExperimentVisitsTable(params: ScheduledEventDetailsTableProps) {
  const { confirm } = params;
  const [scheduledEvent, setScheduledEvent] = useState(params.scheduledEvent);
  const api = useDataApi();
  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });

  const getHumanReadableStatus = (rowData: RowType) => {
    switch (rowData.trainingStatus) {
      case TrainingStatus.ACTIVE:
        return `Valid until ${toFormattedDateTime(rowData.trainingExpiryDate)}`;
      case TrainingStatus.EXPIRED:
        return `Expired ${toFormattedDateTime(rowData.trainingExpiryDate)}`;
      case TrainingStatus.NONE:
        return 'Not started';
      default:
        return 'Unknown';
    }
  };

  const onVisitRegistrationSubmitted = (submittedRegistration: RowType) => {
    setScheduledEvent((prev) => {
      if (!prev.visit) {
        return prev;
      }

      const next = {
        ...prev,
        visit: {
          ...prev.visit,
          registrations: prev.visit.registrations.map((registration) =>
            registration.userId === submittedRegistration.userId
              ? submittedRegistration
              : registration
          ),
        },
      };

      return next;
    });
  };

  const approveVisit = async (visitId: number, userId: number) => {
    const approvedRegistration = (
      await api().approveVisitRegistrations({
        visitRegistrations: [
          {
            visitId,
            userId,
          },
        ],
      })
    ).approveVisitRegistrations[0];

    setScheduledEvent((prev) => {
      if (!prev.visit) {
        return prev;
      }

      const next = {
        ...prev,
        visit: {
          ...prev.visit,
          registrations: prev.visit.registrations.map((registration) =>
            registration.userId === approvedRegistration.userId
              ? approvedRegistration
              : registration
          ),
        },
      };

      return next;
    });
  };

  const onApproveVisitClick = async (visitId: number, userId: number) => {
    confirm(async () => approveVisit(visitId, userId), {
      title: 'Approve visit registration',
      description: 'Are you sure you want to approve this visit registration?',
    })();
  };

  const columns = [
    {
      title: 'Actions',
      sorting: false,
      render: (rowData: RowType) => {
        const editButton = (
          <ButtonWithDialog
            button={
              <IconButton>
                <EditIcon />
              </IconButton>
            }
            title="Edit visit registration"
          >
            <CreateUpdateVisitRegistration
              registration={rowData}
              onSubmitted={onVisitRegistrationSubmitted}
            />
          </ButtonWithDialog>
        );

        switch (rowData.status) {
          case VisitRegistrationStatus.DRAFTED:
          case VisitRegistrationStatus.APPROVED:
          case VisitRegistrationStatus.CANCELLED_BY_USER:
          case VisitRegistrationStatus.CANCELLED_BY_FACILITY:
            return editButton;
          case VisitRegistrationStatus.SUBMITTED:
            return (
              <>
                {editButton}
                <IconButton
                  onClick={() =>
                    onApproveVisitClick(rowData.visitId, rowData.userId)
                  }
                  component="button"
                  data-cy="approve-visit-registration-button"
                >
                  <Tooltip title="Approve visit registration">
                    <CheckCircleOutline />
                  </Tooltip>
                </IconButton>
              </>
            );
          default:
            return null;
        }
      },
    },
    {
      title: 'Status',
      render: (rowData: RowType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <VisitStatusIcon status={rowData.status} />
            <span data-cy="visit-status">{rowData.status}</span>
          </Box>
        );
      },
      field: 'status',
    },
    {
      title: 'Visitor name',
      render: (rowData: RowType) => (
        <VisitorName to={`/People/${rowData.userId}`}>
          {getFullUserName(rowData.user)}
        </VisitorName>
      ),
      customSort: (a: RowType, b: RowType) => {
        return getFullUserName(a.user).localeCompare(getFullUserName(b.user));
      },
    },
    {
      title: 'Teamleader',
      render: (rowData: RowType) =>
        rowData.userId === scheduledEvent.visit?.teamLead.id ? 'Yes' : 'No',
      customSort: (a: RowType) => {
        return a.userId === scheduledEvent.visit?.teamLead.id ? 1 : -1;
      },
    },
    {
      title: 'Visit start',
      field: 'rowData.startsAt',
      render: (rowData: RowType) =>
        rowData.startsAt !== null
          ? toFormattedDateTime(rowData.startsAt)
          : 'Waiting user input',
      customSort: (a: RowType, b: RowType) => {
        const aIsUnfinished = a.startsAt === null;
        const bIsUnfinished = b.startsAt === null;

        if (aIsUnfinished === bIsUnfinished) {
          if (!aIsUnfinished) {
            return a.startsAt.localeCompare(b.startsAt);
          } else {
            return 0;
          }
        }

        return aIsUnfinished ? (bIsUnfinished ? 0 : 1) : bIsUnfinished ? -1 : 0;
      },
    },
    {
      title: 'Visit end',
      field: 'rowData.endsAt',
      render: (rowData: RowType) =>
        rowData.endsAt !== null
          ? toFormattedDateTime(rowData.endsAt)
          : 'Waiting user input',
      customSort: (a: RowType, b: RowType) => {
        const aIsUnfinished = a.endsAt === null;
        const bIsUnfinished = b.endsAt === null;

        if (aIsUnfinished === bIsUnfinished) {
          if (!aIsUnfinished) {
            return a.endsAt.localeCompare(b.endsAt);
          } else {
            return 0;
          }
        }

        return aIsUnfinished ? (bIsUnfinished ? 0 : 1) : bIsUnfinished ? -1 : 0;
      },
    },
    {
      title: 'Training',
      field: 'rowData.trainingStatus',
      render: (rowData: RowType) => getHumanReadableStatus(rowData),
      customSort: (a: RowType, b: RowType) => {
        return a.trainingExpiryDate?.localeCompare(b.trainingExpiryDate) || 0;
      },
    },
  ];

  if (scheduledEvent.visit === null) {
    return (
      <Box sx={{ textAlign: 'center', padding: '20px' }}>
        Visit is not defined
      </Box>
    );
  }

  return (
    <Box
      sx={{
        '& tr:last-child td': {
          border: 'none',
        },
        '& .MuiPaper-root': {
          padding: '0 40px',
          backgroundColor: '#fafafa',
        },
      }}
      data-cy="visit-registrations-table"
    >
      <MaterialTable
        title=""
        icons={tableIcons}
        columns={columns}
        data={scheduledEvent.visit.registrations}
        options={{
          search: false,
          paging: false,
          toolbar: false,
          headerStyle: { backgroundColor: '#fafafa', fontWeight: 'bolder' },
          pageSize: 20,
          padding: 'dense',
        }}
      />
    </Box>
  );
}

export default withConfirm(ExperimentVisitsTable);
