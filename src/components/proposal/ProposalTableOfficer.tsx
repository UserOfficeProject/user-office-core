import { IconButton, Tooltip } from '@material-ui/core';
import { DialogContent, Dialog } from '@material-ui/core';
import { Visibility, Delete, Email, GroupWork } from '@material-ui/icons';
import GetAppIcon from '@material-ui/icons/GetApp';
import MaterialTable, { Column, Options } from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import DialogConfirmation from 'components/common/DialogConfirmation';
import ScienceIconAdd from 'components/common/ScienceIconAdd';
import ScienceIconRemove from 'components/common/ScienceIconRemove';
import AssignProposalsToInstrument from 'components/instrument/AssignProposalsToInstrument';
import AssignProposalToSEP from 'components/SEP/Proposals/AssignProposalToSEP';
import { Instrument, Sep, ProposalsToInstrumentArgs } from 'generated/sdk';
import { ProposalsFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { useLocalStorage } from 'hooks/common/useLocalStorage';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import {
  useProposalsCoreData,
  ProposalViewData,
} from 'hooks/proposal/useProposalsCoreData';
import { excelDownload } from 'utils/excelDownload';
import { tableIcons } from 'utils/materialIcons';

import RankInput from './RankInput';

type ProposalTableOfficerProps = {
  proposalFilter: ProposalsFilter;
  Toolbar: (data: Options) => JSX.Element;
};

const ProposalTableOfficer: React.FC<ProposalTableOfficerProps> = ({
  proposalFilter,
  Toolbar,
}) => {
  const [openDeleteProposals, setOpenDeleteProposals] = useState(false);
  const [openRemoveInstrument, setOpenRemoveInstrument] = useState(false);
  const [openAssignment, setOpenAssignment] = useState(false);
  const [proposalAndInstrumentId, setProposalAndInstrumentId] = useState<{
    proposalId: number | null;
    instrumentId: number | null;
  }>({
    proposalId: null,
    instrumentId: null,
  });
  const [openInstrumentAssignment, setOpenInstrumentAssignment] = useState(
    false
  );
  const [openEmailProposals, setOpenEmailProposals] = useState(false);

  const initalSelectedProposals: ProposalsToInstrumentArgs[] = [];
  const [selectedProposals, setSelectedProposals] = useState(
    initalSelectedProposals
  );
  const downloadPDFProposal = useDownloadPDFProposal();
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [localStorageValue, setLocalStorageValue] = useLocalStorage<
    Column<ProposalViewData>[] | null
  >('proposalColumnsOfficer', null);
  const { loading, setProposalsData, proposalsData } = useProposalsCoreData(
    proposalFilter
  );

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
              prop.instrumentName = null;
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
  const RowActionButtons = (rowData: ProposalViewData) => {
    const iconButtonStyle = { padding: '7px' };

    return (
      <>
        <IconButton data-cy="view-proposal" style={iconButtonStyle}>
          <Link
            to={`/ProposalReviewUserOfficer/${rowData.id}`}
            style={{ color: 'inherit', textDecoration: 'inherit' }}
          >
            <Visibility />
          </Link>
        </IconButton>
        <Tooltip title="Download proposal as pdf">
          <IconButton
            data-cy="download-proposal"
            onClick={() => downloadPDFProposal(rowData.id)}
            style={iconButtonStyle}
          >
            <GetAppIcon />
          </IconButton>
        </Tooltip>

        {rowData.instrumentName && (
          <Tooltip title="Remove assigned instrument">
            <IconButton
              style={iconButtonStyle}
              onClick={() => {
                setProposalAndInstrumentId({
                  proposalId: rowData.id,
                  instrumentId: rowData.instrumentId,
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
  };

  let columns: Column<ProposalViewData>[] = [
    {
      title: 'Actions',
      cellStyle: { padding: 0, minWidth: 120 },
      sorting: false,
      removable: false,
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
      field: 'timeAllocation',
      hidden: true,
    },
    {
      title: 'Technical status',
      field: 'technicalStatus',
    },
    {
      title: 'Status',
      field: 'status',
    },
    {
      title: 'Deviation',
      field: 'reviewDeviation',
    },
    {
      title: 'Average Score',
      field: 'reviewAverage',
    },
    {
      title: 'Final Status',
      field: 'finalStatus',
    },
    {
      title: 'Ranking',
      field: 'rankOrder',
      // To be refactored
      // eslint-disable-next-line react/display-name
      render: (rowData: ProposalViewData) => (
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
      field: 'instrumentName',
    },
    {
      title: 'Call',
      field: 'callShortCode',
    },
    {
      title: 'SEP',
      field: 'sepShortCode',
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
    selectedProposals.forEach(proposal => {
      new Promise(async resolve => {
        await api()
          .notifyProposal({ id: proposal.id })
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
                proposalsData.findIndex(val => val.id === proposal.id)
              ].notified = true;
              setProposalsData([...proposalsData]);
            }
          });

        resolve();
      });
    });
  };

  const deleteProposals = (): void => {
    selectedProposals.forEach(proposal => {
      new Promise(async resolve => {
        await api().deleteProposal({ id: proposal.id });
        proposalsData.splice(
          proposalsData.findIndex(val => val.id === proposal.id),
          1
        );
        setProposalsData([...proposalsData]);
        resolve();
      });
    });
  };

  const assignProposalToSEP = async (sep: Sep): Promise<void> => {
    const assignmentsErrors = await Promise.all(
      selectedProposals.map(async selectedProposal => {
        const result = await api().assignProposal({
          proposalId: selectedProposal.id,
          sepId: sep.id,
        });

        return result.assignProposal.error;
      })
    );

    const isError = !!assignmentsErrors.join('');

    if (!isError) {
      setProposalsData(
        proposalsData.map(prop => {
          if (
            selectedProposals.find(
              selectedProposal => selectedProposal.id === prop.id
            )
          ) {
            prop.sepShortCode = sep.code;
          }

          return prop;
        })
      );
    }

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
        selectedProposals.some(
          selectedProposal => selectedProposal.id === proposalDataItem.id
        ) && proposalDataItem.instrumentId
    );

    if (selectedProposalsWithInstrument.length === 0) {
      const result = await api().assignProposalsToInstrument({
        proposals: selectedProposals,
        instrumentId: instrument.id,
      });
      const isError = !!result.assignProposalsToInstrument.error;

      if (!isError) {
        setProposalsData(
          proposalsData.map(prop => {
            if (
              selectedProposals.find(
                selectedProposal => selectedProposal.id === prop.id
              )
            ) {
              prop.instrumentName = instrument.name;
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
        open={openDeleteProposals}
        action={deleteProposals}
        handleOpen={setOpenDeleteProposals}
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
            callIds={selectedProposals.map(
              selectedProposal => selectedProposal.callId
            )}
          />
        </DialogContent>
      </Dialog>
      <MaterialTable
        icons={tableIcons}
        title={'Proposals'}
        columns={columns}
        data={proposalsData}
        isLoading={loading}
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
          exportCsv: excelDownload,
        }}
        actions={[
          {
            icon: GetAppIconComponent,
            tooltip: 'Download proposals',
            onClick: (event, rowData): void => {
              downloadPDFProposal(
                (rowData as ProposalViewData[]).map(row => row.id).join(',')
              );
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: DeleteIcon,
            tooltip: 'Delete proposals',
            onClick: (event, rowData): void => {
              setOpenDeleteProposals(true);
              setSelectedProposals(
                (rowData as ProposalViewData[]).map(
                  (row: ProposalViewData) => ({
                    id: row.id,
                    callId: row.callId,
                  })
                )
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
                (rowData as ProposalViewData[]).map(
                  (row: ProposalViewData) => ({
                    id: row.id,
                    callId: row.callId,
                  })
                )
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
                (rowData as ProposalViewData[]).map(
                  (row: ProposalViewData) => ({
                    id: row.id,
                    callId: row.callId,
                  })
                )
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
                (rowData as ProposalViewData[]).map(
                  (row: ProposalViewData) => ({
                    id: row.id,
                    callId: row.callId,
                  })
                )
              );
            },
            position: 'toolbarOnSelect',
          },
        ]}
        onChangeColumnHidden={collumnChange => {
          const proposalColumns = columns.map(
            (proposalColumn: Column<ProposalViewData>) => ({
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
