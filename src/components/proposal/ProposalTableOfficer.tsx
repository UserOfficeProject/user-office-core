import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { IconButton, Tooltip } from '@material-ui/core';
import { DialogContent, Dialog } from '@material-ui/core';
import { Visibility, Delete, Email, GroupWork } from '@material-ui/icons';
import GetAppIcon from '@material-ui/icons/GetApp';
import MaterialTable, { Column, Options } from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import XLSX from 'xlsx';

import { Review, ReviewStatus, Instrument } from '../../generated/sdk';
import { ProposalsFilter } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useDownloadPDFProposal } from '../../hooks/useDownloadPDFProposal';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useProposalsData, ProposalData } from '../../hooks/useProposalsData';
import { tableIcons } from '../../utils/materialIcons';
import DialogConfirmation from '../common/DialogConfirmation';
import ScienceIconAdd from '../common/ScienceIconAdd';
import ScienceIconRemove from '../common/ScienceIconRemove';
import AssignProposalsToInstrument from '../instrument/AssignProposalsToInstrument';
import AssignProposalToSEP from '../SEP/AssignProposalToSEP';
import RankInput from './RankInput';

type ProposalTableOfficerProps = {
  proposalFilter: ProposalsFilter;
  Toolbar: (data: Options) => JSX.Element;
};

const ProposalTableOfficer: React.FC<ProposalTableOfficerProps> = ({
  proposalFilter,
  Toolbar,
}) => {
  const { loading, proposalsData, setProposalsData } = useProposalsData(
    proposalFilter
  );
  const [open, setOpen] = React.useState(false);
  const [openRemoveInstrument, setOpenRemoveInstrument] = React.useState(false);
  const [openAssignment, setOpenAssignment] = React.useState(false);
  const [proposalAndInstrumentId, setProposalAndInstrumentId] = React.useState<{
    proposalId: number | null;
    instrumentId: number | null;
  }>({
    proposalId: null,
    instrumentId: null,
  });
  const [
    openInstrumentAssignment,
    setOpenInstrumentAssignment,
  ] = React.useState(false);
  const [openEmailProposals, setOpenEmailProposals] = React.useState(false);

  const initalSelectedProposals: number[] = [];
  const [selectedProposals, setSelectedProposals] = React.useState(
    initalSelectedProposals
  );
  const downloadPDFProposal = useDownloadPDFProposal();
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [localStorageValue, setLocalStorageValue] = useLocalStorage<
    Column<ProposalData>[] | null
  >('proposalColumnsOfficer', null);

  const setNewRanking = (proposalID: number, ranking: number) => {
    api().administrationProposal({
      id: proposalID,
      rankOrder: ranking,
    });
    setProposalsData(
      proposalsData.map(prop => {
        if (prop.id === proposalID) prop.rankOrder = ranking;

        return prop;
      })
    );
  };

  const average = (numbers: number[]) => {
    const sum = numbers.reduce(function(sum, value) {
      return sum + value;
    }, 0);

    const avg = sum / numbers.length;

    return avg;
  };

  const absoluteDifference = (numbers: number[]) => {
    if (numbers.length < 2) {
      return NaN;
    }
    numbers = numbers.sort();

    return Math.abs(numbers[numbers.length - 1] - numbers[0]);
  };

  const standardDeviation = (numbers: number[]) => {
    if (numbers.length < 2) {
      return NaN;
    }
    const avg = average(numbers);

    const squareDiffs = numbers?.map(function(value) {
      const diff = value - avg;
      const sqrDiff = diff * diff;

      return sqrDiff;
    });

    const avgSquareDiff = average(squareDiffs);

    const stdDev = Math.sqrt(avgSquareDiff);

    return stdDev;
  };

  const getGrades = (reviews: Review[] | null | undefined) =>
    reviews
      ?.filter(review => review.status === ReviewStatus.SUBMITTED)
      .map(review => review.grade as number) ?? [];

  const removeProposalFromInstrument = async () => {
    if (
      proposalAndInstrumentId.instrumentId &&
      proposalAndInstrumentId.proposalId
    ) {
      const result = await api().removeProposalFromInstrument({
        proposalId: proposalAndInstrumentId.proposalId,
        instrumentId: proposalAndInstrumentId.instrumentId,
      });

      const isError = !!result.removeProposalFromInstrument.error;

      if (!isError) {
        setProposalsData(
          proposalsData.map(prop => {
            if (prop.id === proposalAndInstrumentId.proposalId) {
              prop.instrument = null;
            }

            return prop;
          })
        );
      }

      const message = isError
        ? 'Could not remove proposal from the instrument'
        : 'Proposal removed from the instrument';
      enqueueSnackbar(message, {
        variant: isError ? 'error' : 'success',
      });

      setProposalAndInstrumentId({ proposalId: null, instrumentId: null });
    }
  };

  const RemoveScienceIcon = (): JSX.Element => <ScienceIconRemove />;

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: ProposalData) => (
    <>
      <IconButton data-cy="view-proposal">
        <Link
          to={`/ProposalReviewUserOfficer/${rowData.id}`}
          style={{ color: 'inherit', textDecoration: 'inherit' }}
        >
          <Visibility />
        </Link>
      </IconButton>
      <IconButton onClick={() => downloadPDFProposal(rowData.id)}>
        <GetAppIcon />
      </IconButton>

      {rowData.instrument && (
        <Tooltip title="Remove assigned instrument">
          <IconButton
            onClick={() => {
              setProposalAndInstrumentId({
                proposalId: rowData.id,
                instrumentId: rowData.instrument?.instrumentId as number,
              });
              setOpenRemoveInstrument(true);
            }}
          >
            <RemoveScienceIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );

  let columns: Column<ProposalData>[] = [
    {
      title: 'Actions',
      cellStyle: { padding: 0, minWidth: 120 },
      sorting: false,
      render: RowActionButtons,
    },
    { title: 'Proposal ID', field: 'shortCode' },
    {
      title: 'Title',
      field: 'title',
      ...{ width: 'auto' },
    },
    {
      title: 'Time(Days)',
      field: 'technicalReview.timeAllocation',
      hidden: true,
    },
    {
      title: 'Technical status',
      render: (rowData: ProposalData): string =>
        rowData.technicalReview
          ? getTranslation(rowData.technicalReview.status as ResourceId)
          : '',
    },
    { title: 'Status', field: 'status' },
    {
      title: 'Deviation',
      field: 'deviation',
      hidden: true,
      render: (rowData: ProposalData): number =>
        standardDeviation(getGrades(rowData.reviews)),
      customSort: (a: ProposalData, b: ProposalData) =>
        (standardDeviation(getGrades(a.reviews)) || 0) -
        (standardDeviation(getGrades(b.reviews)) || 0),
    },
    {
      title: 'Absolute Difference',
      field: 'absolute',
      hidden: true,
      render: (rowData: ProposalData): number =>
        absoluteDifference(getGrades(rowData.reviews)),
      customSort: (a: ProposalData, b: ProposalData) =>
        (absoluteDifference(getGrades(a.reviews)) || 0) -
        (absoluteDifference(getGrades(b.reviews)) || 0),
    },
    {
      title: 'Average Score',
      field: 'average',
      hidden: true,
      render: (rowData: ProposalData): number =>
        average(getGrades(rowData.reviews)),
      customSort: (a: ProposalData, b: ProposalData) =>
        (average(getGrades(a.reviews)) || 0) -
        (average(getGrades(b.reviews)) || 0),
    },
    {
      title: 'Final Status',
      field: 'finalStatus',
      render: (rowData: ProposalData): string =>
        rowData.finalStatus
          ? getTranslation(rowData.finalStatus as ResourceId)
          : '',
    },
    {
      title: 'Ranking',
      field: 'rankOrder',
      // To be refactored
      // eslint-disable-next-line react/display-name
      render: (rowData: ProposalData) => (
        <RankInput
          proposalID={rowData.id}
          defaultvalue={rowData.rankOrder}
          onChange={setNewRanking}
        />
      ),
    },
    { title: 'Notified', field: 'notified' },
    {
      title: 'Instrument',
      render: (rowData: ProposalData): string =>
        rowData.instrument ? rowData.instrument.name : '-',
    },
    {
      title: 'Call',
      render: (rowData: ProposalData): string =>
        rowData.call ? rowData.call.shortCode : '-',
      hidden: true,
    },
    {
      title: 'SEP',
      render: (rowData: ProposalData): string =>
        rowData.sep ? rowData.sep.code : '-',
      hidden: true,
    },
  ];

  // NOTE: We are remapping only the hidden field because functions like `render` can not be stringified.
  if (localStorageValue) {
    columns = columns.map(column => ({
      ...column,
      hidden: localStorageValue?.find(
        localStorageValueItem => localStorageValueItem.title === column.title
      )?.hidden,
    }));
  }

  const emailProposals = (): void => {
    selectedProposals.forEach(id => {
      new Promise(async resolve => {
        await api()
          .notifyProposal({ id })
          .then(data => {
            if (data.notifyProposal.error) {
              enqueueSnackbar(
                `Could not send email to all selected proposals`,
                {
                  variant: 'error',
                }
              );
            } else {
              proposalsData[
                proposalsData.findIndex(val => val.id === id)
              ].notified = true;
              setProposalsData([...proposalsData]);
            }
          });

        resolve();
      });
    });
  };

  const deleteProposals = (): void => {
    selectedProposals.forEach(id => {
      new Promise(async resolve => {
        await api().deleteProposal({ id });
        proposalsData.splice(
          proposalsData.findIndex(val => val.id === id),
          1
        );
        setProposalsData([...proposalsData]);
        resolve();
      });
    });
  };

  const assignProposalToSEP = async (sepId: number): Promise<void> => {
    const assignmentsErrors = await Promise.all(
      selectedProposals.map(async id => {
        const result = await api().assignProposal({ proposalId: id, sepId });

        return result.assignProposal.error;
      })
    );

    const isError = !!assignmentsErrors.join('');
    const message = isError
      ? 'Could not assign all selected proposals to SEP'
      : 'Proposal/s assigned to SEP';
    enqueueSnackbar(message, {
      variant: isError ? 'error' : 'success',
    });
  };

  const assignProposalsToInstrument = async (
    instrument: Instrument
  ): Promise<void> => {
    const selectedProposalsWithInstrument = proposalsData.filter(
      proposalDataItem =>
        selectedProposals.includes(proposalDataItem.id) &&
        proposalDataItem.instrument
    );

    if (selectedProposalsWithInstrument.length === 0) {
      const result = await api().assignProposalsToInstrument({
        proposalIds: selectedProposals,
        instrumentId: instrument.instrumentId,
      });
      const isError = !!result.assignProposalsToInstrument.error;

      if (!isError) {
        setProposalsData(
          proposalsData.map(prop => {
            if (
              selectedProposals.find(
                selectedProposalId => selectedProposalId === prop.id
              )
            ) {
              prop.instrument = instrument;
            }

            return prop;
          })
        );
      }

      const message = isError
        ? 'Could not assign all selected proposals to the instrument'
        : 'Proposal/s assigned to the selected instrument';
      enqueueSnackbar(message, {
        variant: isError ? 'error' : 'success',
      });
    } else {
      enqueueSnackbar(
        'One or more of your selected proposals already have instrument assigned',
        {
          variant: 'error',
        }
      );
    }
  };

  if (loading) {
    return <p>Loading</p>;
  }

  const GetAppIconComponent = (): JSX.Element => <GetAppIcon />;
  const DeleteIcon = (): JSX.Element => <Delete />;
  const GroupWorkIcon = (): JSX.Element => <GroupWork />;
  const EmailIcon = (): JSX.Element => <Email />;
  const AddScienceIcon = (): JSX.Element => <ScienceIconAdd />;

  return (
    <>
      <DialogConfirmation
        title="Delete proposals"
        text="This action will delete proposals and all data associated with them"
        open={open}
        action={deleteProposals}
        handleOpen={setOpen}
      />
      <DialogConfirmation
        title="Remove assigned instrument"
        text="This action will remove assigned instrument from proposal"
        open={openRemoveInstrument}
        action={removeProposalFromInstrument}
        handleOpen={setOpenRemoveInstrument}
      />
      <DialogConfirmation
        title="Notify results"
        text="This action will trigger emails to be sent to principal investigators"
        open={openEmailProposals}
        action={emailProposals}
        handleOpen={setOpenEmailProposals}
      />
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openAssignment}
        onClose={(): void => setOpenAssignment(false)}
      >
        <DialogContent>
          <AssignProposalToSEP
            assignProposalToSEP={assignProposalToSEP}
            close={(): void => setOpenAssignment(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openInstrumentAssignment}
        onClose={(): void => setOpenInstrumentAssignment(false)}
      >
        <DialogContent>
          <AssignProposalsToInstrument
            assignProposalsToInstrument={assignProposalsToInstrument}
            close={(): void => setOpenInstrumentAssignment(false)}
          />
        </DialogContent>
      </Dialog>
      <MaterialTable
        icons={tableIcons}
        title={'Proposals'}
        columns={columns}
        data={proposalsData}
        components={{
          Toolbar: Toolbar,
        }}
        localization={{
          toolbar: {
            exportName: 'Export as Excel',
          },
        }}
        options={{
          search: true,
          selection: true,
          debounceInterval: 400,
          columnsButton: true,
          exportButton: true,
          exportCsv: (columns, data: ProposalData[]) => {
            const dataColumns = [
              'Proposal ID',
              'Title',
              'Principal Investigator',
              'Technical Status',
              'Tehnical Comment',
              'Time(Days)',
              'Score difference',
              'Average Score',
              'Comment Management',
              'Decision',
              'Order',
            ];
            const dataToExport = data.map(proposalData => [
              proposalData.shortCode,
              proposalData.title,
              `${proposalData.proposer.firstname} ${proposalData.proposer.lastname}`,
              getTranslation(
                proposalData.technicalReview?.status as ResourceId
              ),
              proposalData.technicalReview?.publicComment,
              proposalData.technicalReview?.timeAllocation,
              absoluteDifference(getGrades(proposalData.reviews)) || 'NA',
              average(getGrades(proposalData.reviews)) || 'NA',
              proposalData.commentForManagement,
              proposalData.finalStatus,
              proposalData.rankOrder,
            ]);

            const ws = XLSX.utils.aoa_to_sheet([dataColumns, ...dataToExport]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');
            XLSX.writeFile(wb, 'proposals.xlsx');
          },
        }}
        actions={[
          {
            icon: GetAppIconComponent,
            tooltip: 'Download proposals',
            onClick: (event, rowData): void => {
              downloadPDFProposal(
                (rowData as ProposalData[]).map(row => row.id).join(',')
              );
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: DeleteIcon,
            tooltip: 'Delete proposals',
            onClick: (event, rowData): void => {
              setOpen(true);
              setSelectedProposals(
                (rowData as ProposalData[]).map((row: ProposalData) => row.id)
              );
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: GroupWorkIcon,
            tooltip: 'Assign proposals to SEP',
            onClick: (event, rowData): void => {
              setOpenAssignment(true);
              setSelectedProposals(
                (rowData as ProposalData[]).map((row: ProposalData) => row.id)
              );
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: AddScienceIcon,
            tooltip: 'Assign proposals to instrument',
            onClick: (event, rowData): void => {
              setOpenInstrumentAssignment(true);
              setSelectedProposals(
                (rowData as ProposalData[]).map((row: ProposalData) => row.id)
              );
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: EmailIcon,
            tooltip: 'Notify users final result',
            onClick: (event, rowData): void => {
              setOpenEmailProposals(true);
              setSelectedProposals(
                (rowData as ProposalData[]).map((row: ProposalData) => row.id)
              );
            },
            position: 'toolbarOnSelect',
          },
        ]}
        onChangeColumnHidden={collumnChange => {
          const proposalColumns = columns.map(
            (proposalColumn: Column<ProposalData>) => ({
              hidden:
                proposalColumn.title === collumnChange.title
                  ? collumnChange.hidden
                  : proposalColumn.hidden,
              title: proposalColumn.title,
            })
          );

          setLocalStorageValue(proposalColumns);
        }}
      />
    </>
  );
};

ProposalTableOfficer.propTypes = {
  Toolbar: PropTypes.func.isRequired,
  proposalFilter: PropTypes.any,
};

export default ProposalTableOfficer;
