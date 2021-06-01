/* eslint-disable @typescript-eslint/no-explicit-any */
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
import isEqual from 'react-fast-compare';
import { DecodedValueMap, SetQuery } from 'use-query-params';

import ListStatusIcon from 'components/common/icons/ListStatusIcon';
import ScienceIcon from 'components/common/icons/ScienceIcon';
import AssignProposalsToInstrument from 'components/instrument/AssignProposalsToInstrument';
import ProposalReviewContent, {
  TabNames,
} from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import AssignProposalToSEP from 'components/SEP/Proposals/AssignProposalToSEP';
import {
  Call,
  Instrument,
  Proposal,
  ProposalsFilter,
  ProposalStatus,
  ProposalIdWithCallId,
  Sep,
} from 'generated/sdk';
import { useLocalStorage } from 'hooks/common/useLocalStorage';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { useDownloadXLSXProposal } from 'hooks/proposal/useDownloadXLSXProposal';
import {
  ProposalViewData,
  useProposalsCoreData,
} from 'hooks/proposal/useProposalsCoreData';
import {
  fromProposalToProposalView,
  setSortDirectionOnSortColumn,
} from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import CallSelectModalOnProposalClone from './CallSelectModalOnProposalClone';
import ChangeProposalStatus from './ChangeProposalStatus';
import { ProposalUrlQueryParamsType } from './ProposalPage';

type ProposalTableOfficerProps = {
  proposalFilter: ProposalsFilter;
  urlQueryParams: DecodedValueMap<ProposalUrlQueryParamsType>;
  setUrlQueryParams: SetQuery<ProposalUrlQueryParamsType>;
  confirm: WithConfirmType;
};

type ProposalWithCallAndInstrumentId = ProposalIdWithCallId & {
  instrumentId: number | null;
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
  const [openChangeProposalStatus, setOpenChangeProposalStatus] = useState(
    false
  );
  const [selectedProposals, setSelectedProposals] = useState<
    ProposalWithCallAndInstrumentId[]
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
    setPreselectedProposalsData(proposalsData);
  }, [proposalsData]);

  useEffect(() => {
    if (urlQueryParams.selection.length > 0) {
      const selection = new Set(urlQueryParams.selection);

      setPreselectedProposalsData((preselectedProposalsData) => {
        const selected: ProposalWithCallAndInstrumentId[] = [];
        const preselected = preselectedProposalsData.map((proposal) => {
          if (selection.has(proposal.id.toString())) {
            selected.push({
              id: proposal.id,
              callId: proposal.callId,
              instrumentId: proposal.instrumentId,
            });
          }

          return {
            ...proposal,
            tableData: {
              checked: selection.has(proposal.id.toString()),
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
          tableData: { ...(proposal as any).tableData, checked: false },
        }))
      );
      setSelectedProposals([]);
    }
  }, [proposalsData, urlQueryParams.selection]);

  const GetAppIconComponent = (): JSX.Element => <GetAppIcon />;
  const DeleteIcon = (): JSX.Element => <Delete />;
  const GroupWorkIcon = (): JSX.Element => <GroupWork />;
  const EmailIcon = (): JSX.Element => <Email />;
  const ScienceIconComponent = (
    props: JSX.IntrinsicAttributes & {
      children?: React.ReactNode;
      'data-cy'?: string;
    }
  ): JSX.Element => <ScienceIcon {...props} />;
  const ChangeProposalStatusIcon = (
    props: JSX.IntrinsicAttributes & {
      children?: React.ReactNode;
      'data-cy'?: string;
    }
  ): JSX.Element => <ListStatusIcon {...props} />;
  const ExportIcon = (): JSX.Element => <GridOnIcon />;

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: ProposalViewData) => {
    const iconButtonStyle = { padding: '7px' };

    return (
      <>
        <Tooltip title="View proposal">
          <IconButton
            data-cy="view-proposal"
            onClick={() => {
              setUrlQueryParams({ reviewModal: rowData.id });
            }}
            style={iconButtonStyle}
          >
            <Visibility />
          </IconButton>
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
      </>
    );
  };

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
        notifyProposal: { rejection },
      } = await api('Notification sent successfully').notifyProposal({
        id: proposal.id,
      });

      if (rejection) {
        return;
      }

      setProposalsData((proposalsData) =>
        proposalsData.map((prop) => ({
          ...prop,
          notified: prop.id === proposal.id,
        }))
      );
    });
  };

  const deleteProposals = (): void => {
    selectedProposals.forEach(async (proposal) => {
      const {
        deleteProposal: { rejection },
      } = await api().deleteProposal({ id: proposal.id });

      if (rejection) {
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

    const errors = responses.map((item) => item.result.rejection);
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
      setProposalsData((proposalsData) =>
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
    instrument: Instrument | null
  ): Promise<void> => {
    if (instrument) {
      const result = await api(
        'Proposal/s assigned to the selected instrument successfully!'
      ).assignProposalsToInstrument({
        proposals: selectedProposals.map((selectedProposal) => ({
          id: selectedProposal.id,
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
      const result = await api(
        'Proposal/s removed from the instrument successfully!'
      ).removeProposalsFromInstrument({
        proposalIds: selectedProposals.map(
          (selectedProposal) => selectedProposal.id
        ),
      });

      const isError = !!result.removeProposalsFromInstrument.rejection;

      if (!isError) {
        setProposalsData((proposalsData) =>
          proposalsData.map((prop) => {
            if (
              selectedProposals.find(
                (selectedProposal) => selectedProposal.id === prop.id
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

    if (!result.cloneProposal.rejection && proposalsData && resultProposal) {
      const newClonedProposal = fromProposalToProposalView(
        resultProposal as Proposal
      );

      const newProposalsData = [newClonedProposal, ...proposalsData];

      setProposalsData(newProposalsData);
    }
  };

  const changeStatusOnProposals = async (status: ProposalStatus) => {
    if (status?.id && selectedProposals?.length) {
      const shouldAddPluralLetter = selectedProposals.length > 1 ? 's' : '';
      const result = await api(
        `Proposal${shouldAddPluralLetter} status changed successfully!`
      ).changeProposalsStatus({
        proposals: selectedProposals.map((selectedProposal) => ({
          id: selectedProposal.id,
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
                (selectedProposal) => selectedProposal.id === prop.id
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
    (proposal) => proposal.id === urlQueryParams.reviewModal
  );

  const userOfficerProposalReviewTabs: TabNames[] = [
    'Proposal information',
    'Technical review',
    'Reviews',
    'Admin',
    'Logs',
  ];

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
      <ProposalReviewModal
        title={`View proposal: ${proposalToReview?.title} (${proposalToReview?.shortCode})`}
        proposalReviewModalOpen={!!urlQueryParams.reviewModal}
        setProposalReviewModalOpen={(updatedProposal?: Proposal) => {
          setProposalsData(
            proposalsData.map((proposal) => {
              if (proposal.id === updatedProposal?.id) {
                return fromProposalToProposalView(updatedProposal);
              } else {
                return proposal;
              }
            })
          );
          setUrlQueryParams({ reviewModal: undefined });
        }}
        reviewItemId={proposalToReview?.id}
      >
        <ProposalReviewContent
          proposalId={proposalToReview?.id as number}
          tabNames={userOfficerProposalReviewTabs}
        />
      </ProposalReviewModal>
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
          setUrlQueryParams((params) => ({
            ...params,
            selection:
              selectedItems.length > 0
                ? selectedItems.map((selectedItem) =>
                    selectedItem.id.toString()
                  )
                : undefined,
          }));
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
            icon: ScienceIconComponent.bind(null, {
              'data-cy': 'assign-remove-instrument',
            }),
            tooltip: 'Assign/Remove instrument',
            onClick: () => {
              setOpenInstrumentAssignment(true);
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: ChangeProposalStatusIcon.bind(null, {
              'data-cy': 'change-proposal-status',
            }),
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
              sortDirection: orderDirection ? orderDirection : undefined,
            }));
        }}
      />
    </>
  );
};

export default React.memo(withConfirm(ProposalTableOfficer), isEqual);
