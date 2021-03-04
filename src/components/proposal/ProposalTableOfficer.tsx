/* eslint-disable react/prop-types */
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Delete from '@material-ui/icons/Delete';
import Email from '@material-ui/icons/Email';
import FileCopy from '@material-ui/icons/FileCopy';
import GetAppIcon from '@material-ui/icons/GetApp';
import GridOnIcon from '@material-ui/icons/GridOn';
import GroupWork from '@material-ui/icons/GroupWork';
import Visibility from '@material-ui/icons/Visibility';
import MaterialTable, { Column } from 'material-table';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DecodedValueMap, SetQuery } from 'use-query-params';

import ScienceIconAdd from 'components/common/icons/ScienceIconAdd';
import ScienceIconRemove from 'components/common/icons/ScienceIconRemove';
import AssignProposalsToInstrument from 'components/instrument/AssignProposalsToInstrument';
import AssignProposalToSEP from 'components/SEP/Proposals/AssignProposalToSEP';
import {
  Call,
  Instrument,
  ProposalsFilter,
  ProposalsToInstrumentArgs,
  Review,
  Sep,
} from 'generated/sdk';
import { useLocalStorage } from 'hooks/common/useLocalStorage';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { useDownloadXLSXProposal } from 'hooks/proposal/useDownloadXLSXProposal';
import {
  ProposalViewData,
  useProposalsCoreData,
} from 'hooks/proposal/useProposalsCoreData';
import { setSortDirectionOnSortColumn } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import { average, getGrades, standardDeviation } from 'utils/mathFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import CallSelectModalOnProposalClone from './CallSelectModalOnProposalClone';
import { ProposalUrlQueryParamsType } from './ProposalPage';
import RankInput from './RankInput';

type ProposalTableOfficerProps = {
  proposalFilter: ProposalsFilter;
  urlQueryParams: DecodedValueMap<ProposalUrlQueryParamsType>;
  setUrlQueryParams: SetQuery<ProposalUrlQueryParamsType>;
  confirm: WithConfirmType;
};

const ProposalTableOfficer: React.FC<ProposalTableOfficerProps> = ({
  proposalFilter,
  urlQueryParams,
  setUrlQueryParams,
  confirm,
}) => {
  const [openAssignment, setOpenAssignment] = useState(false);
  const [openInstrumentAssignment, setOpenInstrumentAssignment] = useState(
    false
  );
  const [selectedProposals, setSelectedProposals] = useState<
    ProposalsToInstrumentArgs[]
  >([]);
  const [preselectedProposalsData, setPreselectedProposalsData] = useState<
    ProposalViewData[]
  >([]);
  const [openCallSelection, setOpenCallSelection] = useState(false);
  const [proposalToCloneId, setProposalToCloneId] = useState<number | null>(
    null
  );

  const downloadPDFProposal = useDownloadPDFProposal();
  const downloadXLSXProposal = useDownloadXLSXProposal();
  const { api } = useDataApiWithFeedback();
  const { enqueueSnackbar } = useSnackbar();
  const [localStorageValue, setLocalStorageValue] = useLocalStorage<
    Column<ProposalViewData>[] | null
  >('proposalColumnsOfficer', null);
  const { loading, setProposalsData, proposalsData } = useProposalsCoreData(
    proposalFilter
  );

  useEffect(() => {
    if (urlQueryParams.selection.length > 0) {
      const proposalsWithTableDataCheckedProperty = proposalsData.map(
        (proposal) => {
          return {
            ...proposal,
            tableData: {
              checked: urlQueryParams.selection?.some(
                (selectedItem: string | null) =>
                  selectedItem === proposal.id.toString()
              ),
            },
          };
        }
      );

      const onlySelectedProposals = proposalsWithTableDataCheckedProperty.filter(
        (proposal) => proposal.tableData.checked
      );

      setPreselectedProposalsData(proposalsWithTableDataCheckedProperty);
      setSelectedProposals(onlySelectedProposals);
    } else {
      setPreselectedProposalsData(proposalsData);
    }
  }, [proposalsData, urlQueryParams.selection]);

  const setNewRanking = (proposalID: number, ranking: number) => {
    api().administrationProposal({
      id: proposalID,
      rankOrder: ranking,
    });
    setProposalsData(
      proposalsData.map((prop) => {
        if (prop.id === proposalID) prop.rankOrder = ranking;

        return prop;
      })
    );
  };

  const removeProposalFromInstrument = async (
    proposalId: number,
    instrumentId: number | null
  ) => {
    if (!instrumentId || !proposalId) {
      return;
    }

    const result = await api(
      'Proposal removed from the instrument successfully!'
    ).removeProposalFromInstrument({
      proposalId,
      instrumentId,
    });

    const isError = !!result.removeProposalFromInstrument.error;

    if (!isError) {
      setProposalsData(
        proposalsData.map((prop) => {
          if (prop.id === proposalId) {
            prop.instrumentName = null;
            prop.instrumentId = null;
          }

          return prop;
        })
      );
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
        <Tooltip title="View proposal">
          <Link
            to={`/ProposalReviewUserOfficer/${rowData.id}`}
            style={{ color: 'inherit', textDecoration: 'inherit' }}
          >
            <IconButton data-cy="view-proposal" style={iconButtonStyle}>
              <Visibility />
            </IconButton>
          </Link>
        </Tooltip>
        <Tooltip title="Clone proposal">
          <IconButton
            data-cy="clone-proposal"
            onClick={() => {
              setProposalToCloneId(rowData.id);
              setOpenCallSelection(true);
            }}
            style={iconButtonStyle}
          >
            <FileCopy />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download proposal as pdf">
          <IconButton
            data-cy="download-proposal"
            onClick={() => downloadPDFProposal([rowData.id], rowData.title)}
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
                confirm(
                  async () => {
                    await removeProposalFromInstrument(
                      rowData.id,
                      rowData.instrumentId
                    );
                  },
                  {
                    title: 'Remove assigned instrument',
                    description:
                      'This action will remove assigned instrument from proposal.',
                  }
                )();
              }}
            >
              <RemoveScienceIcon />
            </IconButton>
          </Tooltip>
        )}
      </>
    );
  };
  const RankComponent = (rowData: ProposalViewData) => (
    <RankInput
      proposalID={rowData.id}
      defaultValue={rowData.rankOrder}
      onChange={setNewRanking}
    />
  );

  let columns: Column<ProposalViewData>[] = [
    {
      title: 'Actions',
      cellStyle: { padding: 0, minWidth: 152 },
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
      title: 'Submitted',
      render: (rowData) => (rowData.submitted ? 'Yes' : 'No'),
    },
    {
      title: 'Status',
      field: 'statusName',
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
      render: RankComponent,
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
      field: 'sepCode',
    },
  ];

  // NOTE: We are remapping only the hidden field because functions like `render` can not be stringified.
  if (localStorageValue) {
    columns = columns.map((column) => ({
      ...column,
      hidden: localStorageValue?.find(
        (localStorageValueItem) => localStorageValueItem.title === column.title
      )?.hidden,
    }));
  }

  // TODO: Maybe it will be good to make notifyProposal and deleteProposal bulk functions where we can sent array of proposal ids.
  const emailProposals = (): void => {
    selectedProposals.forEach(async (proposal) => {
      const {
        notifyProposal: { error },
      } = await api('Notification sent successfully').notifyProposal({
        id: proposal.id,
      });

      if (error) {
        return;
      }

      proposalsData[
        proposalsData.findIndex((val) => val.id === proposal.id)
      ].notified = true;
      setProposalsData([...proposalsData]);
    });
  };

  const deleteProposals = (): void => {
    selectedProposals.forEach(async (proposal) => {
      const {
        deleteProposal: { error },
      } = await api().deleteProposal({ id: proposal.id });

      if (error) {
        return;
      }

      setProposalsData((proposalsData) =>
        proposalsData.filter(({ id }) => id !== proposal.id)
      );
    });
  };

  const assignProposalToSEP = async (sep: Sep): Promise<void> => {
    const responses = await Promise.all(
      selectedProposals.map(async (selectedProposal) => {
        const result = await api().assignProposalToSEP({
          proposalId: selectedProposal.id,
          sepId: sep.id,
        });

        return {
          result: result.assignProposalToSEP,
          proposalId: selectedProposal.id,
        };
      })
    );

    const errors = responses.map((item) => item.result.error);
    const isError = !!errors.join('');

    enqueueSnackbar(
      isError
        ? 'Proposal/s can not be assigned to SEP'
        : 'Proposal/s assigned to SEP',
      {
        variant: isError ? 'error' : 'success',
        className: isError ? 'snackbar-error' : 'snackbar-success',
      }
    );

    if (!isError) {
      setProposalsData(
        proposalsData.map((prop) => {
          if (
            selectedProposals.find(
              (selectedProposal) => selectedProposal.id === prop.id
            )
          ) {
            prop.sepCode = sep.code;

            const proposalNextStatusResponse = responses.find(
              (item) => item.proposalId === prop.id
            );

            if (proposalNextStatusResponse?.result.nextProposalStatus?.name) {
              prop.statusName =
                proposalNextStatusResponse.result.nextProposalStatus.name;
            }
          }

          return prop;
        })
      );
    }
  };

  const assignProposalsToInstrument = async (
    instrument: Instrument
  ): Promise<void> => {
    const selectedProposalsWithInstrument = proposalsData.filter(
      (proposalDataItem) =>
        selectedProposals.some(
          (selectedProposal) => selectedProposal.id === proposalDataItem.id
        ) && proposalDataItem.instrumentId
    );

    if (selectedProposalsWithInstrument.length === 0) {
      const result = await api(
        'Proposal/s assigned to the selected instrument'
      ).assignProposalsToInstrument({
        proposals: selectedProposals,
        instrumentId: instrument.id,
      });
      const isError = !!result.assignProposalsToInstrument.error;

      if (!isError) {
        setProposalsData(
          proposalsData.map((prop) => {
            if (
              selectedProposals.find(
                (selectedProposal) => selectedProposal.id === prop.id
              )
            ) {
              prop.instrumentName = instrument.name;
              prop.instrumentId = instrument.id;
            }

            return prop;
          })
        );
      }
    } else {
      enqueueSnackbar(
        'One or more of your selected proposals already have instrument assigned',
        {
          variant: 'error',
        }
      );
    }
  };

  const cloneProposalToCall = async (call: Call) => {
    setProposalToCloneId(null);

    if (!call?.id || !proposalToCloneId) {
      return;
    }

    const result = await api('Proposal cloned successfully').cloneProposal({
      callId: call.id,
      proposalToCloneId,
    });

    const resultProposal = result.cloneProposal.proposal;

    if (!result.cloneProposal.error && proposalsData && resultProposal) {
      const newClonedProposal: ProposalViewData = {
        id: resultProposal.id,
        title: resultProposal.title,
        status: resultProposal.status?.name || '',
        statusId: resultProposal.status?.id || 1,
        statusName: resultProposal.status?.name || '',
        statusDescription: resultProposal.status?.description || '',
        submitted: resultProposal.submitted,
        shortCode: resultProposal.shortCode,
        rankOrder: resultProposal.rankOrder,
        finalStatus: resultProposal.finalStatus,
        timeAllocation: resultProposal.technicalReview?.timeAllocation || null,
        technicalStatus: resultProposal.technicalReview?.status || '',
        instrumentName: resultProposal.instrument?.name || null,
        instrumentId: resultProposal.instrument?.id || null,
        reviewAverage:
          average(getGrades(resultProposal.reviews as Review[])) || null,
        reviewDeviation:
          standardDeviation(getGrades(resultProposal.reviews as Review[])) ||
          null,
        sepCode: '',
        callShortCode: resultProposal.call?.shortCode || null,
        notified: resultProposal.notified,
        callId: resultProposal.callId,
      };

      const newProposalsData = [newClonedProposal, ...proposalsData];

      setProposalsData(newProposalsData);
    }
  };

  const GetAppIconComponent = (): JSX.Element => <GetAppIcon />;
  const DeleteIcon = (): JSX.Element => <Delete />;
  const GroupWorkIcon = (): JSX.Element => <GroupWork />;
  const EmailIcon = (): JSX.Element => <Email />;
  const AddScienceIcon = (
    props: JSX.IntrinsicAttributes & {
      children?: React.ReactNode;
      'data-cy'?: string;
    }
  ): JSX.Element => <ScienceIconAdd {...props} />;
  const ExportIcon = (): JSX.Element => <GridOnIcon />;

  columns = setSortDirectionOnSortColumn(
    columns,
    urlQueryParams.sortColumn,
    urlQueryParams.sortDirection
  );

  return (
    <>
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
              (selectedProposal) => selectedProposal.callId
            )}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openCallSelection}
        onClose={(): void => setOpenCallSelection(false)}
      >
        <DialogContent>
          <CallSelectModalOnProposalClone
            cloneProposalToCall={cloneProposalToCall}
            close={(): void => setOpenCallSelection(false)}
          />
        </DialogContent>
      </Dialog>
      <MaterialTable
        icons={tableIcons}
        title={'Proposals'}
        columns={columns}
        data={preselectedProposalsData}
        isLoading={loading}
        onSearchChange={(searchText) => {
          setUrlQueryParams({ search: searchText ? searchText : undefined });
        }}
        onSelectionChange={(selectedItems) => {
          setUrlQueryParams({
            selection:
              selectedItems.length > 0
                ? selectedItems.map((selectedItem) =>
                    selectedItem.id.toString()
                  )
                : undefined,
          });
          setSelectedProposals(selectedItems);
        }}
        options={{
          search: true,
          searchText: urlQueryParams.search || undefined,
          selection: true,
          debounceInterval: 400,
          columnsButton: true,
        }}
        actions={[
          {
            icon: GetAppIconComponent,
            tooltip: 'Download proposals in PDF',
            onClick: (event, rowData): void => {
              downloadPDFProposal(
                (rowData as ProposalViewData[]).map((row) => row.id),
                (rowData as ProposalViewData[])[0].title
              );
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: ExportIcon,
            tooltip: 'Export proposals in Excel',
            onClick: (event, rowData): void => {
              downloadXLSXProposal(
                (rowData as ProposalViewData[]).map((row) => row.id),
                (rowData as ProposalViewData[])[0].title
              );
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: DeleteIcon,
            tooltip: 'Delete proposals',
            onClick: (event, rowData): void => {
              setSelectedProposals(
                (rowData as ProposalViewData[]).map(
                  (row: ProposalViewData) => ({
                    id: row.id,
                    callId: row.callId,
                  })
                )
              );

              confirm(
                () => {
                  deleteProposals();
                },
                {
                  title: 'Delete proposals',
                  description:
                    'This action will delete proposals and all data associated with them.',
                }
              )();
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
            icon: AddScienceIcon.bind(null, {
              'data-cy': 'assign-proposals-to-instrument',
            }),
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
              setSelectedProposals(
                (rowData as ProposalViewData[]).map(
                  (row: ProposalViewData) => ({
                    id: row.id,
                    callId: row.callId,
                  })
                )
              );

              confirm(
                () => {
                  emailProposals();
                },
                {
                  title: 'Notify results',
                  description:
                    'This action will trigger emails to be sent to principal investigators.',
                }
              )();
            },
            position: 'toolbarOnSelect',
          },
        ]}
        onChangeColumnHidden={(columnChange) => {
          const proposalColumns = columns.map(
            (proposalColumn: Column<ProposalViewData>) => ({
              hidden:
                proposalColumn.title === columnChange.title
                  ? columnChange.hidden
                  : proposalColumn.hidden,
              title: proposalColumn.title,
            })
          );

          setLocalStorageValue(proposalColumns);
        }}
        onOrderChange={(orderedColumnId, orderDirection) => {
          setUrlQueryParams &&
            setUrlQueryParams({
              sortColumn: orderedColumnId >= 0 ? orderedColumnId : undefined,
              sortDirection: orderDirection ? orderDirection : undefined,
            });
        }}
      />
    </>
  );
};

export default React.memo(
  withConfirm(ProposalTableOfficer),
  (prevProps, nextProps) =>
    JSON.stringify(prevProps.proposalFilter) ===
    JSON.stringify(nextProps.proposalFilter)
);
