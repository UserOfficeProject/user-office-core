import MaterialTable from '@material-table/core';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import MailIcon from '@mui/icons-material/Mail';
import { IconButton, styled, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import CreateUpdateCancelVisitRegistration from 'components/visit/CreateUpdateCancelVisitRegistration';
import VisitStatusIcon from 'components/visit/VisitStatusIcon';
import { SettingsContext } from 'context/SettingsContextProvider';
import {
  SettingsId,
  VisitRegistrationStatus,
  GetExperimentsQuery,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useDataApi } from 'hooks/common/useDataApi';
import { tableIcons } from 'utils/materialIcons';
import { getFullUserName } from 'utils/user';
import withConfirm, { WithConfirmProps } from 'utils/withConfirm';

type RowType = NonNullable<
  GetExperimentsQuery['experiments'][0]['visit']
>['registrations'][0];

type Experiment = GetExperimentsQuery['experiments'][0];

interface ExperimentDetailsTableProps extends WithConfirmProps {
  experiment: Experiment;
}

const VisitorName = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const ActionDiv = styled('div')({
  display: 'flex',
});

function ExperimentVisitsTable(params: ExperimentDetailsTableProps) {
  const { confirm } = params;
  const [experiment, setExperiment] = useState(params.experiment);
  const { settingsMap } = useContext(SettingsContext);
  const organisationName = settingsMap
    .get(SettingsId.ORGANISATION_NAME)
    ?.settingsValue?.valueOf();
  const [selectedVisit, setSelectedVisit] = useState<RowType | null>(null);

  const api = useDataApi();
  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });

  const onVisitRegistrationSubmitted = (submittedRegistration: RowType) => {
    setExperiment((prev) => {
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

  const replaceVisitRegistration = (
    newRegistration: NonNullable<Experiment['visit']>['registrations'][0]
  ): void => {
    setExperiment((prev) => {
      if (!prev.visit) {
        return prev;
      }

      const next = {
        ...prev,
        visit: {
          ...prev.visit,
          registrations: prev.visit.registrations.map((registration) =>
            registration.userId === newRegistration.userId
              ? newRegistration
              : registration
          ),
        },
      };

      return next;
    });
  };

  const cancelVisit = async (visitId: number, userId: number) => {
    const cancelledRegistration = (
      await api().cancelVisitRegistration({
        visitRegistration: {
          visitId,
          userId,
        },
      })
    ).cancelVisitRegistration;

    replaceVisitRegistration(cancelledRegistration);
  };

  const approveVisit = async (visitId: number, userId: number) => {
    const approvedRegistration = (
      await api().approveVisitRegistration({
        visitRegistration: {
          visitId,
          userId,
        },
      })
    ).approveVisitRegistration;

    replaceVisitRegistration(approvedRegistration);
  };

  const onApproveVisitClick = async (visitId: number, userId: number) => {
    confirm(async () => approveVisit(visitId, userId), {
      title: 'Approve visit registration',
      description: 'Are you sure you want to approve this visit registration?',
    })();
  };

  const onCancelVisitClick = async (visitId: number, userId: number) => {
    confirm(async () => cancelVisit(visitId, userId), {
      title: 'Cancel visit registration',
      description: 'Are you sure you want to cancel this visit registration?',
    })();
  };

  const columns = [
    {
      title: 'Actions',
      sorting: false,
      render: (rowData: RowType) => {
        const editButton = (
          <IconButton onClick={() => setSelectedVisit(rowData)}>
            <EditIcon />
          </IconButton>
        );

        const approveButton = (
          <IconButton
            onClick={() => onApproveVisitClick(rowData.visitId, rowData.userId)}
            component="button"
            data-cy="approve-visit-registration-button"
          >
            <Tooltip title="Approve visit registration">
              <CheckIcon />
            </Tooltip>
          </IconButton>
        );

        const cancelButton = (
          <IconButton
            onClick={() => onCancelVisitClick(rowData.visitId, rowData.userId)}
            component="button"
            data-cy="cancel-visit-registration-button"
          >
            <Tooltip title="Cancel visit registration">
              <ClearIcon />
            </Tooltip>
          </IconButton>
        );

        const subject = organisationName
          ? `Important information regarding your experiment at ${organisationName}`
          : 'Important information regarding your experiment';
        const sendEmailButton = (
          <IconButton
            component="a"
            href={`
              mailto:${rowData.user?.email || ''}?subject=${subject}&body=Dear ${getFullUserName(rowData.user)},%0D%0A%0D%0AWe are writing regarding your proposal "${
                params.experiment.proposal.title
              }" with proposal ID ${
                params.experiment.proposal.proposalId
              }.%0D%0A%0D%0A.%0D%0A%0D%0AKind regards`}
            data-cy="send-email-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MailIcon />
          </IconButton>
        );

        switch (rowData.status) {
          case VisitRegistrationStatus.DRAFTED:
            return (
              <ActionDiv>
                {sendEmailButton}
                {cancelButton}
                {editButton}
              </ActionDiv>
            );
          case VisitRegistrationStatus.SUBMITTED:
            return (
              <ActionDiv>
                {sendEmailButton}
                {approveButton}
                {cancelButton}
                {editButton}
              </ActionDiv>
            );
          case VisitRegistrationStatus.APPROVED:
            return (
              <ActionDiv>
                {sendEmailButton}
                {cancelButton}
              </ActionDiv>
            );
          case VisitRegistrationStatus.CANCELLED_BY_USER:
            return <ActionDiv>{sendEmailButton}</ActionDiv>;
          case VisitRegistrationStatus.CANCELLED_BY_FACILITY:
            return <ActionDiv>{sendEmailButton}</ActionDiv>;
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
        rowData.userId === experiment.visit?.teamLead.id ? 'Yes' : 'No',
      customSort: (a: RowType) => {
        return a.userId === experiment.visit?.teamLead.id ? 1 : -1;
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
  ];

  if (experiment.visit === null) {
    return (
      <Box sx={{ textAlign: 'center', padding: '20px' }}>
        Visit is not defined
      </Box>
    );
  }

  return (
    <>
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
          data={experiment.visit.registrations}
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
      <CreateUpdateCancelVisitRegistration
        registration={selectedVisit}
        onSubmitted={onVisitRegistrationSubmitted}
        onClose={() => setSelectedVisit(null)}
        onCancelled={replaceVisitRegistration}
      />
    </>
  );
}

export default withConfirm(ExperimentVisitsTable);
