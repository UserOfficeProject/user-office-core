import AddAlarmIcon from '@mui/icons-material/AddAlarm';
import DoneAll from '@mui/icons-material/DoneAll';
import GridOnIcon from '@mui/icons-material/GridOn';
import RemoveDone from '@mui/icons-material/RemoveDone';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import i18n from 'i18n';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import MaterialTable from 'components/common/DenseMaterialTable';
import FapInstrumentProposalsTable from 'components/fap/MeetingComponents/FapInstrumentProposalsTable';
import { Call, InstrumentWithAvailabilityTime, UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useDownloadXLSXFap } from 'hooks/fap/useDownloadXLSXFap';
import { useInstrumentsByFapData } from 'hooks/instrument/useInstrumentsByFapData';
import { BOLD_TEXT_STYLE } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import FapUpdateInstrumentTime from './FapUpdateInstrumentTime';

type FapMeetingInstrumentsTableProps = {
  fapId: number;
  selectedCall: Call;
  confirm: WithConfirmType;
  code: string;
};

const instrumentTableColumns = [
  { title: 'Name', field: 'name' },
  { title: 'Short code', field: 'shortCode' },
  { title: 'Description', field: 'description' },
  {
    title: 'Availability time',
    field: 'availabilityTime',
    emptyValue: '-',
  },
  {
    title: 'Submitted',
    field: 'submitted',
    lookup: { true: 'Yes', false: 'No' },
  },
];

const FapMeetingInstrumentsTable = ({
  fapId,
  selectedCall,
  confirm,
  code,
}: FapMeetingInstrumentsTableProps) => {
  const { loadingInstruments, instrumentsData, setInstrumentsData } =
    useInstrumentsByFapData(fapId, selectedCall.id);
  const { api } = useDataApiWithFeedback();
  const hasAccessRights = useCheckAccess([UserRole.USER_OFFICER]);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const downloadFapXLSX = useDownloadXLSXFap();
  const [updateInstrumentTime, setUpdateInstrumentTime] =
    useState<InstrumentWithAvailabilityTime | null>(null);
  const [dialogOpen, setDialogOpen] = useState<Map<number, string[]>>(
    new Map<number, string[]>()
  );

  const columns = instrumentTableColumns.map((column) => ({
    ...column,
    title:
      column.field === 'availabilityTime'
        ? `${column.title} (${selectedCall.allocationTimeUnit}s)`
        : column.title,
  }));

  const FapInstrumentProposalsTableComponent = React.useCallback(
    ({ rowData }: { rowData: InstrumentWithAvailabilityTime }) => {
      return (
        <FapInstrumentProposalsTable
          fapId={fapId}
          fapInstrument={rowData}
          selectedCall={selectedCall}
        />
      );
    },
    [fapId, selectedCall]
  );

  const instrumentMap = new Map<number, string>();

  instrumentsData.map((inst) => {
    instrumentMap.set(inst.id, inst.name);
  });

  const submitInstrumentInFap = async (
    instrumentToSubmit: InstrumentWithAvailabilityTime
  ) => {
    if (!selectedCall) {
      return;
    }

    if (instrumentToSubmit) {
      const response = await api().fapProposalsByInstrument({
        instrumentId: instrumentToSubmit.id,
        fapId: fapId,
        callId: selectedCall.id,
      });
      const allProposalsOnInstrumentHaveRankings =
        response.fapProposalsByInstrument?.every(
          ({ proposal }) =>
            !!proposal.fapMeetingDecisions?.find(
              (fmd) => fmd.instrumentId === instrumentToSubmit.id
            )?.submitted
        );

      if (allProposalsOnInstrumentHaveRankings) {
        const { submitInstrumentInFap } = await api({
          toastSuccessMessage: 'Instrument submitted in FAP!',
        }).submitInstrumentInFap({
          callId: selectedCall.id,
          instrumentId: instrumentToSubmit.id,
          fapId: fapId,
        });
        if (submitInstrumentInFap) {
          const newInstrumentsData = instrumentsData.map((instrument) => {
            if (instrument.id === instrumentToSubmit.id) {
              return { ...instrument, submitted: true };
            }

            return instrument;
          });
          setInstrumentsData(newInstrumentsData);
        }
      } else {
        enqueueSnackbar('All proposal Fap meetings should be submitted', {
          variant: 'error',
          className: 'snackbar-error',
        });
      }
    }
  };

  const unsubmitInstrumentInFap = async (
    instrumentToUnsubmit: InstrumentWithAvailabilityTime
  ) => {
    if (!selectedCall) {
      return;
    }

    if (instrumentToUnsubmit) {
      if (instrumentToUnsubmit.submitted) {
        const { unsubmitInstrumentInFap } = await api({
          toastSuccessMessage: 'Instrument unsubmitted!',
        }).unsubmitInstrumentInFap({
          callId: selectedCall.id,
          instrumentId: instrumentToUnsubmit.id,
          fapId: fapId,
        });
        if (unsubmitInstrumentInFap) {
          const newInstrumentsData = instrumentsData.map((instrument) => {
            if (instrument.id === instrumentToUnsubmit.id) {
              return { ...instrument, submitted: false };
            }

            return instrument;
          });
          setInstrumentsData(newInstrumentsData);
        }
      } else {
        enqueueSnackbar('Proposal FAP instrument is not submitted', {
          variant: 'error',
          className: 'snackbar-error',
        });
      }
    }
  };

  const DoneAllIcon = (): JSX.Element => <DoneAll />;
  const RemoveDoneIcon = (): JSX.Element => <RemoveDone />;
  const AddTimeIcon = (): JSX.Element => <AddAlarmIcon />;

  const accessDependentActions = [];

  if (hasAccessRights) {
    accessDependentActions.push(
      (
        rowData:
          | InstrumentWithAvailabilityTime
          | InstrumentWithAvailabilityTime[]
      ) => ({
        icon: DoneAllIcon,
        hidden: !!(rowData as InstrumentWithAvailabilityTime).submitted,
        onClick: (
          event: Event,
          rowData:
            | InstrumentWithAvailabilityTime
            | InstrumentWithAvailabilityTime[]
        ) =>
          confirm(
            () => {
              submitInstrumentInFap(rowData as InstrumentWithAvailabilityTime);
            },
            {
              title: 'Submit ' + i18n.format(t('instrument'), 'lowercase'),
              description: `No further changes to FAP meeting decisions and rankings are possible after submission. Are you sure you want to submit the ${(rowData as InstrumentWithAvailabilityTime).name} ${t(
                'instrument'
              )}?`,
            }
          )(),
        tooltip: 'Submit ' + i18n.format(t('instrument'), 'lowercase'),
      }),
      (
        rowData:
          | InstrumentWithAvailabilityTime
          | InstrumentWithAvailabilityTime[]
      ) => ({
        icon: RemoveDoneIcon,
        hidden: !(rowData as InstrumentWithAvailabilityTime).submitted,
        onClick: (
          event: Event,
          rowData:
            | InstrumentWithAvailabilityTime
            | InstrumentWithAvailabilityTime[]
        ) =>
          confirm(
            () => {
              unsubmitInstrumentInFap(
                rowData as InstrumentWithAvailabilityTime
              );
            },
            {
              title: 'Unsubmit ' + i18n.format(t('instrument'), 'lowercase'),
              description: `This action will reopen the proposal reordering in the meeting components. Are you sure you want to unsubmit the ${(rowData as InstrumentWithAvailabilityTime).name} ${t(
                'instrument'
              )}?`,
            }
          )(),
        tooltip: 'Unsubmit ' + i18n.format(t('instrument'), 'lowercase'),
      })
    );
    accessDependentActions.push((rowData: InstrumentWithAvailabilityTime) => ({
      icon: AddTimeIcon,
      onClick: () => {
        setUpdateInstrumentTime(rowData);
      },
      tooltip: 'Update ' + i18n.format(t('instrument'), 'lowercase') + ' Time',
    }));
  }

  const updatedInstrumentTime = (newTime: number, instrumentId: number) => {
    setInstrumentsData(
      instrumentsData.map((inst) =>
        inst.id === instrumentId ? { ...inst, availabilityTime: newTime } : inst
      )
    );
    setUpdateInstrumentTime(null);
  };

  const handleClose = () => {
    setDialogOpen(new Map<number, string[]>());
  };

  return (
    <div data-cy="Fap-meeting-components-table">
      <Dialog
        fullWidth
        open={!!dialogOpen.size}
        onClose={handleClose}
        data-cy="confirmation-dialog"
      >
        <DialogTitle
          sx={{
            marginTop: '12px',
            color: 'red',
          }}
        >
          Some proposals could not be submitted
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={BOLD_TEXT_STYLE}>
            The Following proposals could not be submitted
          </DialogContentText>
          {Array.from(dialogOpen).map((proposals) => (
            <>
              <DialogContentText
                key={'instrument-' + proposals[0]}
                sx={{ ml: '10px', fontWeight: 'bold' }}
              >
                {instrumentMap.get(proposals[0]) + ': '}
              </DialogContentText>
              {proposals[1].map((proposal) => {
                return (
                  <DialogContentText
                    data-cy={'proposal-' + proposal}
                    key={'proposal-' + proposal}
                    sx={{ ml: '15px' }}
                  >
                    {proposal}
                  </DialogContentText>
                );
              })}
            </>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} data-cy="confirm-ok" variant="text">
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <MaterialTable
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h1">
            {`${code} - ${i18n.format(
              t('instrument'),
              'plural'
            )} with proposals`}
          </Typography>
        }
        columns={columns}
        data={instrumentsData}
        isLoading={loadingInstruments}
        actions={[
          ...accessDependentActions,
          {
            icon: GridOnIcon,
            tooltip: 'Export in Excel',
            disabled: !selectedCall || loadingInstruments,
            onClick: (): void => {
              if (selectedCall.id) {
                downloadFapXLSX(
                  fapId,
                  selectedCall.id,
                  selectedCall.shortCode ?? 'unknown'
                );
              }
            },
            position: 'toolbar',
          },
        ]}
        detailPanel={[
          {
            tooltip: 'Show proposals',
            render: FapInstrumentProposalsTableComponent,
          },
        ]}
        options={{
          search: true,
          debounceInterval: 400,
        }}
      />

      {updateInstrumentTime && selectedCall && (
        <FapUpdateInstrumentTime
          close={(): void => setUpdateInstrumentTime(null)}
          updateTime={updatedInstrumentTime}
          callId={selectedCall.id}
          instrument={updateInstrumentTime}
        ></FapUpdateInstrumentTime>
      )}
      <Button
        onClick={async () => {
          const unSubmittedProposals = await api().SubmitFapMeetingDecisions({
            submitFapMeetingDecisionsInput: {
              callId: selectedCall.id,
              fapId: fapId,
            },
          });
          const unSubmittedProposalInstrumentMap = new Map<number, string[]>();

          unSubmittedProposals.submitFapMeetingDecisions.map((proposal) => {
            if (unSubmittedProposalInstrumentMap.has(proposal.instrumentId)) {
              unSubmittedProposalInstrumentMap
                .get(proposal.instrumentId)
                ?.push(proposal.proposal.proposalId);
            } else {
              unSubmittedProposalInstrumentMap.set(proposal.instrumentId, [
                proposal.proposal.proposalId,
              ]);
            }
          });
          setDialogOpen(unSubmittedProposalInstrumentMap);
        }}
        data-cy="submit-all-button"
      >
        Submit All Completed
      </Button>
    </div>
  );
};

export default withConfirm(FapMeetingInstrumentsTable);
