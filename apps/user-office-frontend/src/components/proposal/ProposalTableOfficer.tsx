import MaterialTable, { Column } from '@material-table/core';
import Delete from '@mui/icons-material/Delete';
import Email from '@mui/icons-material/Email';
import FileCopy from '@mui/icons-material/FileCopy';
import GetAppIcon from '@mui/icons-material/GetApp';
import GridOnIcon from '@mui/icons-material/GridOn';
import GroupWork from '@mui/icons-material/GroupWork';
import Visibility from '@mui/icons-material/Visibility';
import { Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, { useContext, useEffect, useState } from 'react';
import isEqual from 'react-fast-compare';
import { DecodedValueMap, SetQuery } from 'use-query-params';

import ListStatusIcon from 'components/common/icons/ListStatusIcon';
import ScienceIcon from 'components/common/icons/ScienceIcon';
import AssignProposalsToInstrument from 'components/instrument/AssignProposalsToInstrument';
import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import AssignProposalsToSEP from 'components/SEP/Proposals/AssignProposalsToSEP';
import { FeatureContext } from 'context/FeatureContextProvider';
import {
  Call,
  Proposal,
  ProposalsFilter,
  ProposalStatus,
  ProposalPkWithCallId,
  Sep,
  InstrumentFragment,
  FeatureId,
} from 'generated/sdk';
import { useLocalStorage } from 'hooks/common/useLocalStorage';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { useDownloadXLSXProposal } from 'hooks/proposal/useDownloadXLSXProposal';
import {
  ProposalViewData,
  useProposalsCoreData,
} from 'hooks/proposal/useProposalsCoreData';
import {
  addColumns,
  fromProposalToProposalView,
  removeColumns,
  setSortDirectionOnSortColumn,
} from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import CallSelectModalOnProposalsClone from './CallSelectModalOnProposalClone';
import ChangeProposalStatus from './ChangeProposalStatus';
import { ProposalUrlQueryParamsType } from './ProposalPage';

type ProposalTableOfficerProps = {
  proposalFilter: ProposalsFilter;
  urlQueryParams: DecodedValueMap<ProposalUrlQueryParamsType>;
  setUrlQueryParams: SetQuery<ProposalUrlQueryParamsType>;
  confirm: WithConfirmType;
};

type ProposalWithCallInstrumentAndSepId = ProposalPkWithCallId & {
  instrumentId: number | null;
  sepId: number | null;
  statusId: number;
};

export type QueryParameters = {
  first?: number;
  offset?: number;
  sortField?: string | undefined;
  sortDirection?: string | undefined;
  searchText?: string | undefined;
};

let columns: Column<ProposalViewData>[] = [
  {
    title: 'Actions',
    cellStyle: { padding: 0 },
    sorting: false,
    removable: false,
    field: 'rowActionButtons',
  },
  { title: 'Proposal ID', field: 'proposalId' },
  {
    title: 'Title',
    field: 'title',
    ...{ width: 'auto' },
  },
  {
    title: 'Submitted',
    field: 'submitted',
    lookup: { true: 'Yes', false: 'No' },
  },
  {
    title: 'Status',
    field: 'statusName',
  },
  {
    title: 'Notified',
    field: 'notified',
    lookup: { true: 'Yes', false: 'No' },
  },
  {
    title: 'Call',
    field: 'callShortCode',
  },
];

const technicalReviewColumns = [
  { title: 'Technical status', field: 'technicalStatus', emptyValue: '-' },
  {
    title: 'Assigned technical reviewer',
    field: 'assignedTechnicalReviewer',
    emptyValue: '-',
  },
  {
    title: 'Technical time allocation',
    field: 'technicalTimeAllocationRendered',
    emptyValue: '-',
    hidden: true,
  },
];

const instrumentManagementColumns = [
  { title: 'Instrument', field: 'instrumentName', emptyValue: '-' },
];

const SEPReviewColumns = [
  { title: 'Final status', field: 'finalStatus', emptyValue: '-' },
  {
    title: 'Final time allocation',
    field: 'finalTimeAllocationRendered',
    emptyValue: '-',
    hidden: true,
  },
  { title: 'Deviation', field: 'reviewDeviation', emptyValue: '-' },
  { title: 'Average Score', field: 'reviewAverage', emptyValue: '-' },
  { title: 'Ranking', field: 'rankOrder', emptyValue: '-' },
  { title: 'SEP', field: 'sepCode', emptyValue: '-' },
];

const ProposalTableOfficer: React.FC<ProposalTableOfficerProps> = ({
  proposalFilter,
  urlQueryParams,
  setUrlQueryParams,
  confirm,
}) => {
  const [openAssignment, setOpenAssignment] = useState(false);
  const [openInstrumentAssignment, setOpenInstrumentAssignment] =
    useState(false);
  const [openChangeProposalStatus, setOpenChangeProposalStatus] =
    useState(false);
  const [selectedProposals, setSelectedProposals] = useState<
    ProposalWithCallInstrumentAndSepId[]
  >([]);
  const [tableData, setTableData] = useState<ProposalViewData[]>([]);
  const [preselectedProposalsData, setPreselectedProposalsData] = useState<
    ProposalViewData[]
  >([]);
  const [openCallSelection, setOpenCallSelection] = useState(false);

  const downloadPDFProposal = useDownloadPDFProposal();
  const downloadXLSXProposal = useDownloadXLSXProposal();
  const { api } = useDataApiWithFeedback();
  const [localStorageValue, setLocalStorageValue] = useLocalStorage<
    Column<ProposalViewData>[] | null
  >('proposalColumnsOfficer', null);
  const featureContext = useContext(FeatureContext);

  const prefetchSize = 200;
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [query, setQuery] = useState<QueryParameters>({
    first: prefetchSize,
    offset: 0,
    sortField: urlQueryParams?.sortField,
    sortDirection: urlQueryParams?.sortDirection ?? undefined,
    searchText: urlQueryParams?.search ?? undefined,
  });
  const { loading, setProposalsData, proposalsData, totalCount } =
    useProposalsCoreData(proposalFilter, query);

  useEffect(() => {
    setPreselectedProposalsData(proposalsData);
  }, [proposalsData, query]);

  useEffect(() => {
    let isMounted = true;
    let endSlice = rowsPerPage * (currentPage + 1);
    endSlice = endSlice == 0 ? prefetchSize + 1 : endSlice + 1; // Final page of a loaded section would produce the slice (x, 0) without this
    if (isMounted) {
      setTableData(
        preselectedProposalsData.slice(
          (currentPage * rowsPerPage) % prefetchSize,
          endSlice
        )
      );
    }

    return () => {
      isMounted = false;
    };
  }, [currentPage, rowsPerPage, preselectedProposalsData, query]);

  useEffect(() => {
    if (urlQueryParams.selection.length > 0) {
      const selection = new Set(urlQueryParams.selection);
      setPreselectedProposalsData((preselectedProposalsData) => {
        const selected: ProposalWithCallInstrumentAndSepId[] = [];
        const preselected = preselectedProposalsData.map((proposal) => {
          if (selection.has(proposal.primaryKey.toString())) {
            selected.push({
              primaryKey: proposal.primaryKey,
              callId: proposal.callId,
              instrumentId: proposal.instrumentId,
              sepId: proposal.sepId,
              statusId: proposal.statusId,
            });
          }

          return {
            ...proposal,
            tableData: {
              checked: selection.has(proposal.primaryKey.toString()),
            },
          };
        });

        setSelectedProposals(selected);

        return preselected;
      });
    } else {
      setPreselectedProposalsData((proposalsData) =>
        proposalsData.map((proposal) => ({
          ...proposal,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tableData: { ...(proposal as any).tableData, checked: false },
        }))
      );
      setSelectedProposals([]);
    }
  }, [proposalsData, urlQueryParams.selection]);

  const GetAppIconComponent = (): JSX.Element => (
    <GetAppIcon data-cy="download-proposals" />
  );
  const DeleteIcon = (): JSX.Element => <Delete />;
  const GroupWorkIcon = (): JSX.Element => <GroupWork />;
  const EmailIcon = (): JSX.Element => <Email />;
  const ScienceIconComponent = (): JSX.Element => (
    <ScienceIcon data-cy="assign-remove-instrument" />
  );
  const ChangeProposalStatusIcon = (): JSX.Element => (
    <ListStatusIcon data-cy="change-proposal-status" />
  );
  const ExportIcon = (): JSX.Element => <GridOnIcon />;

  const isTechnicalReviewEnabled = featureContext.featuresMap.get(
    FeatureId.TECHNICAL_REVIEW
  )?.isEnabled;
  const isInstrumentManagementEnabled = featureContext.featuresMap.get(
    FeatureId.INSTRUMENT_MANAGEMENT
  )?.isEnabled;
  const isSEPEnabled = featureContext.featuresMap.get(
    FeatureId.SEP_REVIEW
  )?.isEnabled;

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: ProposalViewData) => (
    <Tooltip title="View proposal">
      <IconButton
        data-cy="view-proposal"
        onClick={() => {
          setUrlQueryParams({ reviewModal: rowData.primaryKey });
        }}
      >
        <Visibility />
      </IconButton>
    </Tooltip>
  );

  if (isTechnicalReviewEnabled) {
    addColumns(columns, technicalReviewColumns);
  } else {
    removeColumns(columns, technicalReviewColumns);
  }

  if (isInstrumentManagementEnabled) {
    addColumns(columns, instrumentManagementColumns);
  } else {
    removeColumns(columns, instrumentManagementColumns);
  }

  if (isSEPEnabled) {
    addColumns(columns, SEPReviewColumns);
  } else {
    removeColumns(columns, SEPReviewColumns);
  }

  columns = columns.map((v: Column<ProposalViewData>) => {
    v.customSort = () => 0; // Disables client side sorting

    return v;
  });

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
        notifyProposal: { rejection },
      } = await api({
        toastSuccessMessage: 'Notification sent successfully',
      }).notifyProposal({
        proposalPk: proposal.primaryKey,
      });

      if (rejection) {
        return;
      }

      setProposalsData((proposalsData) =>
        proposalsData.map((prop) => ({
          ...prop,
          notified: prop.primaryKey === proposal.primaryKey,
        }))
      );
    });
  };

  const deleteProposals = (): void => {
    selectedProposals.forEach(async (proposal) => {
      const {
        deleteProposal: { rejection },
      } = await api().deleteProposal({ proposalPk: proposal.primaryKey });

      if (rejection) {
        return;
      }

      setProposalsData((proposalsData) =>
        proposalsData.filter(
          ({ primaryKey }) => primaryKey !== proposal.primaryKey
        )
      );
    });
  };

  const assignProposalsToSEP = async (sep: Sep | null): Promise<void> => {
    if (sep) {
      const response = await api({
        toastSuccessMessage:
          'Proposal/s assigned to the selected SEP successfully!',
      }).assignProposalsToSep({
        proposals: selectedProposals.map((selectedProposal) => ({
          primaryKey: selectedProposal.primaryKey,
          callId: selectedProposal.callId,
        })),
        sepId: sep.id,
      });

      const isError = !!response.assignProposalsToSep.rejection;

      if (!isError) {
        setProposalsData((proposalsData) =>
          proposalsData.map((prop) => {
            if (
              selectedProposals.find(
                (selectedProposal) =>
                  selectedProposal.primaryKey === prop.primaryKey
              )
            ) {
              prop.sepCode = sep.code;
              prop.sepId = sep.id;

              if (response.assignProposalsToSep.nextProposalStatus?.name) {
                prop.statusName =
                  response.assignProposalsToSep.nextProposalStatus.name;
              }
            }

            return prop;
          })
        );
      }
    } else {
      const result = await api({
        toastSuccessMessage: 'Proposal/s removed from the SEP successfully!',
      }).removeProposalsFromSep({
        proposalPks: selectedProposals.map(
          (selectedProposal) => selectedProposal.primaryKey
        ),
        sepId: selectedProposals[0].sepId as number,
      });

      const isError = !!result.removeProposalsFromSep.rejection;

      if (!isError) {
        setProposalsData((proposalsData) =>
          proposalsData.map((prop) => {
            if (
              selectedProposals.find(
                (selectedProposal) =>
                  selectedProposal.primaryKey === prop.primaryKey
              )
            ) {
              prop.sepCode = null;
              prop.sepId = null;
            }

            return prop;
          })
        );
      }
    }
  };

  const assignProposalsToInstrument = async (
    instrument: InstrumentFragment | null
  ): Promise<void> => {
    if (instrument) {
      const result = await api({
        toastSuccessMessage:
          'Proposal/s assigned to the selected instrument successfully!',
      }).assignProposalsToInstrument({
        proposals: selectedProposals.map((selectedProposal) => ({
          primaryKey: selectedProposal.primaryKey,
          callId: selectedProposal.callId,
        })),
        instrumentId: instrument.id,
      });
      const isError = !!result.assignProposalsToInstrument.rejection;

      if (!isError) {
        setProposalsData((proposalsData) =>
          proposalsData.map((prop) => {
            if (
              selectedProposals.find(
                (selectedProposal) =>
                  selectedProposal.primaryKey === prop.primaryKey
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
      const result = await api({
        toastSuccessMessage:
          'Proposal/s removed from the instrument successfully!',
      }).removeProposalsFromInstrument({
        proposalPks: selectedProposals.map(
          (selectedProposal) => selectedProposal.primaryKey
        ),
      });

      const isError = !!result.removeProposalsFromInstrument.rejection;

      if (!isError) {
        setProposalsData((proposalsData) =>
          proposalsData.map((prop) => {
            if (
              selectedProposals.find(
                (selectedProposal) =>
                  selectedProposal.primaryKey === prop.primaryKey
              )
            ) {
              prop.instrumentName = null;
              prop.instrumentId = null;
            }

            return prop;
          })
        );
      }
    }
  };

  const cloneProposalsToCall = async (call: Call) => {
    if (!call?.id || !selectedProposals.length) {
      return;
    }

    const proposalsToClonePk = selectedProposals.map(
      (selectedProposal) => selectedProposal.primaryKey
    );

    const result = await api({
      toastSuccessMessage: 'Proposal/s cloned successfully',
    }).cloneProposals({
      callId: call.id,
      proposalsToClonePk,
    });
    const resultProposals = result.cloneProposals.proposals;

    if (!result.cloneProposals.rejection && proposalsData && resultProposals) {
      const newClonedProposals = resultProposals.map((resultProposal) =>
        fromProposalToProposalView(resultProposal as Proposal)
      );

      const newProposalsData = [...newClonedProposals, ...proposalsData];

      setProposalsData(newProposalsData);
    }
  };

  const changeStatusOnProposals = async (status: ProposalStatus) => {
    if (status?.id && selectedProposals?.length) {
      const shouldAddPluralLetter = selectedProposals.length > 1 ? 's' : '';
      const result = await api({
        toastSuccessMessage: `Proposal${shouldAddPluralLetter} status changed successfully!`,
      }).changeProposalsStatus({
        proposals: selectedProposals.map((selectedProposal) => ({
          primaryKey: selectedProposal.primaryKey,
          callId: selectedProposal.callId,
        })),
        statusId: status.id,
      });

      const isError = !!result.changeProposalsStatus.rejection;

      if (!isError) {
        const shouldChangeSubmittedValue = status.shortCode === 'DRAFT';

        setProposalsData((proposalsData) =>
          proposalsData.map((prop) => {
            if (
              selectedProposals.find(
                (selectedProposal) =>
                  selectedProposal.primaryKey === prop.primaryKey
              )
            ) {
              prop.statusId = status.id;
              prop.statusName = status.name;
              prop.statusDescription = status.description;

              if (shouldChangeSubmittedValue) {
                prop.submitted = false;
              }
            }

            return prop;
          })
        );
      }
    }
  };

  columns = setSortDirectionOnSortColumn(
    columns,
    urlQueryParams.sortColumn,
    urlQueryParams.sortDirection
  );

  const proposalToReview = proposalsData.find(
    (proposal) => proposal.primaryKey === urlQueryParams.reviewModal
  );

  const userOfficerProposalReviewTabs = [
    PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
    ...(isTechnicalReviewEnabled
      ? [PROPOSAL_MODAL_TAB_NAMES.TECHNICAL_REVIEW]
      : []),
    ...(isSEPEnabled ? [PROPOSAL_MODAL_TAB_NAMES.REVIEWS] : []),
    PROPOSAL_MODAL_TAB_NAMES.ADMIN,
    PROPOSAL_MODAL_TAB_NAMES.LOGS,
  ];

  /** NOTE:
   * Including the id property for https://material-table-core.com/docs/breaking-changes#id
   * Including the action buttons as property to avoid the console warning(https://github.com/material-table-core/core/issues/286)
   */
  const preselectedProposalDataWithIdAndRowActions = tableData.map((proposal) =>
    Object.assign(proposal, {
      id: proposal.primaryKey,
      rowActionButtons: RowActionButtons(proposal),
      assignedTechnicalReviewer: proposal.technicalReviewAssigneeFirstName
        ? `${proposal.technicalReviewAssigneeFirstName} ${proposal.technicalReviewAssigneeLastName}`
        : '-',
      technicalTimeAllocationRendered: proposal.technicalTimeAllocation
        ? `${proposal.technicalTimeAllocation}(${proposal.allocationTimeUnit}s)`
        : '-',
      finalTimeAllocationRendered: proposal.managementTimeAllocation
        ? `${proposal.managementTimeAllocation}(${proposal.allocationTimeUnit}s)`
        : '-',
    })
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
          <AssignProposalsToSEP
            assignProposalsToSEP={assignProposalsToSEP}
            close={(): void => setOpenAssignment(false)}
            sepIds={selectedProposals.map(
              (selectedProposal) => selectedProposal.sepId
            )}
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
            instrumentIds={selectedProposals.map(
              (selectedProposal) => selectedProposal.instrumentId
            )}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openChangeProposalStatus}
        onClose={(): void => setOpenChangeProposalStatus(false)}
      >
        <DialogContent>
          <ChangeProposalStatus
            changeStatusOnProposals={changeStatusOnProposals}
            close={(): void => setOpenChangeProposalStatus(false)}
            selectedProposalStatuses={selectedProposals.map(
              (selectedProposal) => selectedProposal.statusId
            )}
            allSelectedProposalsHaveInstrument={selectedProposals.every(
              (selectedProposal) => selectedProposal.instrumentId
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
          <CallSelectModalOnProposalsClone
            cloneProposalsToCall={cloneProposalsToCall}
            close={(): void => setOpenCallSelection(false)}
          />
        </DialogContent>
      </Dialog>
      <ProposalReviewModal
        title={`View proposal: ${proposalToReview?.title} (${proposalToReview?.proposalId})`}
        proposalReviewModalOpen={!!urlQueryParams.reviewModal}
        setProposalReviewModalOpen={(updatedProposal?: Proposal) => {
          setProposalsData(
            proposalsData.map((proposal) => {
              if (proposal.primaryKey === updatedProposal?.primaryKey) {
                return fromProposalToProposalView(updatedProposal);
              } else {
                return proposal;
              }
            })
          );
          setUrlQueryParams({ reviewModal: undefined });
        }}
        reviewItemId={proposalToReview?.primaryKey}
      >
        <ProposalReviewContent
          proposalPk={proposalToReview?.primaryKey as number}
          tabNames={userOfficerProposalReviewTabs}
        />
      </ProposalReviewModal>
      <MaterialTable
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            Proposals
          </Typography>
        }
        columns={columns}
        data={preselectedProposalDataWithIdAndRowActions}
        totalCount={totalCount}
        page={currentPage}
        onPageChange={(page, pageSize) => {
          const newOffset =
            Math.floor((pageSize * page) / prefetchSize) * prefetchSize;
          if (page !== currentPage && newOffset != query.offset) {
            setQuery({ ...query, offset: newOffset });
          }
          setCurrentPage(page);
        }}
        onRowsPerPageChange={(rowsPerPage) => setRowsPerPage(rowsPerPage)}
        isLoading={loading}
        onSearchChange={(searchText) => {
          setQuery({
            ...query,
            searchText: searchText ? searchText : undefined,
          });
          setUrlQueryParams({ search: searchText ? searchText : undefined });
        }}
        onSelectionChange={(selectedItems) => {
          setUrlQueryParams((params) => ({
            ...params,
            selection:
              selectedItems.length > 0
                ? selectedItems.map((selectedItem) =>
                    selectedItem.primaryKey.toString()
                  )
                : undefined,
          }));
        }}
        options={{
          search: true,
          searchText: urlQueryParams.search || undefined,
          selection: true,
          headerSelectionProps: {
            inputProps: { 'aria-label': 'Select All Rows' },
          },
          debounceInterval: 400,
          columnsButton: true,
          selectionProps: (rowdata: ProposalViewData) => ({
            inputProps: {
              'aria-label': `${rowdata.title}-select`,
            },
          }),
        }}
        actions={[
          {
            icon: FileCopy,
            tooltip: 'Clone proposals to call',
            onClick: () => {
              setOpenCallSelection(true);
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: GetAppIconComponent,
            tooltip: 'Download proposals',
            onClick: (event, rowData): void => {
              downloadPDFProposal(
                (rowData as ProposalViewData[]).map((row) => row.primaryKey),
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
                (rowData as ProposalViewData[]).map((row) => row.primaryKey),
                (rowData as ProposalViewData[])[0].title
              );
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: DeleteIcon,
            tooltip: 'Delete proposals',
            onClick: () => {
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
            onClick: () => {
              setOpenAssignment(true);
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: ScienceIconComponent,
            tooltip: 'Assign/Remove instrument',
            onClick: () => {
              setOpenInstrumentAssignment(true);
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: ChangeProposalStatusIcon,
            tooltip: 'Change proposal status',
            onClick: () => {
              setOpenChangeProposalStatus(true);
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: EmailIcon,
            tooltip: 'Notify users final result',
            onClick: () => {
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
            setUrlQueryParams((params) => ({
              ...params,
              sortColumn: orderedColumnId >= 0 ? orderedColumnId : undefined,
              sortField:
                orderedColumnId >= 0
                  ? columns[orderedColumnId].field?.toString()
                  : undefined,
              sortDirection: orderDirection ? orderDirection : undefined,
            }));
          if (orderDirection && orderedColumnId > 0) {
            setQuery({
              ...query,
              sortField: columns[orderedColumnId].field?.toString(),
              sortDirection: orderDirection,
            });
          } else {
            delete query.sortField;
            delete query.sortDirection;
            setQuery(query);
          }
        }}
      />
    </>
  );
};

export default React.memo(withConfirm(ProposalTableOfficer), isEqual);
