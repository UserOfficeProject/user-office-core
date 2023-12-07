import { Action, Column, MTableToolbar } from '@material-table/core';
import DoneAll from '@mui/icons-material/DoneAll';
import Edit from '@mui/icons-material/Edit';
import GetAppIcon from '@mui/icons-material/GetApp';
import Visibility from '@mui/icons-material/Visibility';
import { Box, Button, Dialog, DialogContent } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { proposalTechnicalReviewValidationSchema } from '@user-office-software/duo-validation';
import { TFunction } from 'i18next';
import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import MaterialTable from 'components/common/DenseMaterialTable';
import { DefaultQueryParams } from 'components/common/SuperMaterialTable';
import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import ReviewerFilterComponent, {
  reviewFilter,
} from 'components/review/ReviewerFilter';
import { FeatureContext } from 'context/FeatureContextProvider';
import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import {
  FeatureId,
  Proposal,
  ProposalsFilter,
  ReviewerFilter,
  SubmitTechnicalReviewInput,
  SettingsId,
  UserRole,
} from 'generated/sdk';
import { useInstrumentScientistCallsData } from 'hooks/call/useInstrumentScientistCallsData';
import { useLocalStorage } from 'hooks/common/useLocalStorage';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { useDownloadProposalAttachment } from 'hooks/proposal/useDownloadProposalAttachment';
import {
  ProposalViewData,
  useProposalsCoreData,
} from 'hooks/proposal/useProposalsCoreData';
import { useProposalStatusesData } from 'hooks/settings/useProposalStatusesData';
import {
  addColumns,
  removeColumns,
  setSortDirectionOnSortColumn,
} from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import ProposalAttachmentDownload from './ProposalAttachmentDownload';
import ProposalFilterBar, {
  questionaryFilterFromUrlQuery,
} from './ProposalFilterBar';
import TableActionsDropdownMenu from './TableActionsDropdownMenu';

type QueryParameters = {
  query: {
    first?: number;
    offset?: number;
  };
  searchText?: string | undefined;
};
const getFilterReviewer = (selected: string | ReviewerFilter) =>
  selected === ReviewerFilter.ME ? ReviewerFilter.ME : ReviewerFilter.ALL;

enum DownloadMenuOption {
  PROPOSAL = 'Proposal(s)',
  ATTACHMENT = 'Attachment(s)',
}

let columns: Column<ProposalViewData>[] = [
  {
    title: 'Actions',
    cellStyle: { padding: 0, minWidth: 120 },
    sorting: false,
    removable: false,
    field: 'rowActionButtons',
  },
  {
    title: 'Proposal ID',
    field: 'proposalId',
  },
  {
    title: 'Title',
    field: 'title',
    ...{ width: 'auto' },
  },
  {
    title: 'Principal Investigator',
    field: 'principalInvestigator',
    emptyValue: '-',
    render: (proposalView) => {
      if (
        proposalView.principalInvestigator?.lastname &&
        proposalView.principalInvestigator?.firstname
      ) {
        return `${proposalView.principalInvestigator.lastname}, ${proposalView.principalInvestigator.firstname}`;
      }

      return '';
    },
  },
  {
    title: 'PI Email',
    field: 'principalInvestigator.email',
    emptyValue: '-',
  },
  {
    title: 'Submitted',
    field: 'submitted',
    lookup: { true: 'Yes', false: 'No' },
  },
  { title: 'Status', field: 'statusName' },
  {
    title: 'Call',
    field: 'callShortCode',
    emptyValue: '-',
    hidden: true,
  },
];

const technicalReviewColumns: Column<ProposalViewData>[] = [
  {
    title: 'Technical status',
    field: 'technicalStatus',
    emptyValue: '-',
  },
  {
    title: 'Technical time allocation',
    field: 'technicalTimeAllocationRendered',
    emptyValue: '-',
  },
  {
    title: 'Assigned technical reviewer',
    field: 'assignedTechnicalReviewer',
    emptyValue: '-',
  },
];

const instrumentManagementColumns = (
  t: TFunction<'translation', undefined, 'translation'>
) => [{ title: t('instrument'), field: 'instrumentName', emptyValue: '-' }];

const FapReviewColumns = [
  { title: 'Final status', field: 'finalStatus', emptyValue: '-' },
  { title: 'Fap', field: 'fapCode', emptyValue: '-', hidden: true },
];

const proposalStatusFilter: Record<string, number> = {
  ALL: 0,
  FEASIBILITY_REVIEW: 2,
};

const PREFETCH_SIZE = 200;
const SELECT_ALL_ACTION_TOOLTIP = 'select-all-prefetched-proposals';
/**
 * NOTE: This toolbar "select all" option works only with all prefetched proposals. Currently that value is set to "PREFETCH_SIZE=200"
 * For example if we change the PREFETCH_SIZE to 100, that would mean that it can select up to 100 prefetched proposals at once.
 * For now this works but if we want to support option where we really select all proposals in the database this needs to be refactored a bit.
 */
const ToolbarWithSelectAllPrefetched = (props: {
  actions: Action<ProposalViewData>[];
  selectedRows: ProposalViewData[];
  data: ProposalViewData[];
}) => {
  const selectAllAction = props.actions.find(
    (action) => action.hidden && action.tooltip === SELECT_ALL_ACTION_TOOLTIP
  );
  const tableHasData = !!props.data.length;
  const allItemsSelectedOnThePage =
    props.selectedRows.length === props.data.length;

  return (
    <div data-cy="select-all-toolbar">
      <MTableToolbar {...props} />
      {tableHasData && !!selectAllAction && allItemsSelectedOnThePage && (
        <Box
          textAlign="center"
          padding={1}
          bgcolor={(theme) => theme.palette.background.default}
          data-cy="select-all-proposals"
        >
          {selectAllAction.iconProps?.hidden ? (
            <>
              All proposals are selected.
              <Button
                variant="text"
                onClick={() => selectAllAction.onClick(null, props.data)}
                data-cy="clear-all-selection"
              >
                Clear selection
              </Button>
            </>
          ) : (
            <>
              All {props.selectedRows.length} proposals on this page are
              selected.
              <Button
                variant="text"
                onClick={() => selectAllAction.onClick(null, props.data)}
                data-cy="select-all-prefetched-proposals"
              >
                Select all {selectAllAction.iconProps?.defaultValue} proposals
              </Button>
            </>
          )}
        </Box>
      )}
    </div>
  );
};
const ProposalTableInstrumentScientist = ({
  confirm,
}: {
  confirm: WithConfirmType;
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedProposals, setSelectedProposals] = useState<
    ProposalViewData[]
  >([]);
  const { user } = useContext(UserContext);
  const featureContext = useContext(FeatureContext);
  const { api } = useDataApiWithFeedback();
  const { settingsMap } = useContext(SettingsContext);
  const [actionsMenuAnchorElement, setActionsMenuAnchorElement] =
    useState<null | HTMLElement>(null);
  const [openDownloadAttachment, setOpenDownloadAttachment] = useState(false);
  const { t } = useTranslation();
  const isInstrumentScientist = useCheckAccess([UserRole.INSTRUMENT_SCIENTIST]);
  const isInternalReviewer = useCheckAccess([UserRole.INTERNAL_REVIEWER]);
  const statusFilterValue = isInstrumentScientist
    ? settingsMap.get(SettingsId.DEFAULT_INST_SCI_STATUS_FILTER)
        ?.settingsValue || 2
    : 0;
  let statusFilter = proposalStatusFilter[statusFilterValue];
  if (statusFilter === undefined || statusFilter === null) {
    statusFilter = isInstrumentScientist ? 2 : 0;
  }
  const reviewFilterValue = isInstrumentScientist
    ? settingsMap.get(SettingsId.DEFAULT_INST_SCI_REVIEWER_FILTER)
        ?.settingsValue || 'ME'
    : 'ALL';
  let reviewerFilter = reviewFilter[reviewFilterValue];
  if (!reviewerFilter) {
    reviewerFilter = isInstrumentScientist
      ? ReviewerFilter.ME
      : ReviewerFilter.ALL;
  }
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    ...DefaultQueryParams,
    call: NumberParam,
    instrument: NumberParam,
    proposalStatus: withDefault(NumberParam, statusFilter),
    questionId: StringParam,
    compareOperator: StringParam,
    value: StringParam,
    dataType: StringParam,
    reviewModal: NumberParam,
    modalTab: NumberParam,
    reviewer: withDefault(StringParam, reviewerFilter),
  });
  // NOTE: proposalStatusId has default value 2 because for Instrument Scientist default view should be all proposals in FEASIBILITY_REVIEW status
  const [proposalFilter, setProposalFilter] = useState<ProposalsFilter>({
    callId: urlQueryParams.call,
    instrumentId: urlQueryParams.instrument,
    proposalStatusId: urlQueryParams.proposalStatus,
    questionFilter: questionaryFilterFromUrlQuery(urlQueryParams),
    reviewer: getFilterReviewer(urlQueryParams.reviewer),
  });
  const [queryParameters, setQueryParameters] = useState<QueryParameters>({
    query: {
      first: PREFETCH_SIZE,
      offset: 0,
    },
    searchText: urlQueryParams.search ?? undefined,
  });
  const { instruments, loadingInstruments } = useInstrumentsData();
  const { calls, loadingCalls } = useInstrumentScientistCallsData(user.id);
  const { proposalStatuses, loadingProposalStatuses } =
    useProposalStatusesData();

  const { loading, proposalsData, totalCount, setProposalsData } =
    useProposalsCoreData(
      {
        proposalStatusId: proposalFilter.proposalStatusId,
        instrumentId: proposalFilter.instrumentId,
        callId: proposalFilter.callId,
        questionFilter: proposalFilter.questionFilter,
        reviewer: proposalFilter.reviewer,
        text: queryParameters.searchText,
      },
      queryParameters.query
    );

  const [tableData, setTableData] = useState<ProposalViewData[]>([]);
  const [preselectedProposalsData, setPreselectedProposalsData] = useState<
    ProposalViewData[]
  >([]);

  useEffect(() => {
    setPreselectedProposalsData(proposalsData);
  }, [proposalsData, queryParameters]);

  useEffect(() => {
    let isMounted = true;
    let endSlice = rowsPerPage * (currentPage + 1);
    endSlice = endSlice == 0 ? PREFETCH_SIZE + 1 : endSlice; // Final page of a loaded section would produce the slice (x, 0) without this
    if (isMounted) {
      setTableData(
        preselectedProposalsData.slice(
          (currentPage * rowsPerPage) % PREFETCH_SIZE,
          endSlice
        )
      );
    }

    return () => {
      isMounted = false;
    };
  }, [currentPage, rowsPerPage, preselectedProposalsData, queryParameters]);

  useEffect(() => {
    if (urlQueryParams.selection.length > 0) {
      const selection = new Set(urlQueryParams.selection);
      const selected: ProposalViewData[] = [];
      setPreselectedProposalsData(
        proposalsData.map((proposal) => {
          if (selection.has(proposal.primaryKey.toString())) {
            selected.push(proposal);
          }

          return {
            ...proposal,
            tableData: {
              checked: selection.has(proposal.primaryKey.toString()),
            },
          };
        })
      );
      setSelectedProposals(selected);
    } else {
      setPreselectedProposalsData(
        proposalsData.map((proposal) => ({
          ...proposal,
          tableData: { checked: false },
        }))
      );
      setSelectedProposals([]);
    }
  }, [proposalsData, urlQueryParams.selection]);

  const downloadPDFProposal = useDownloadPDFProposal();
  const downloadProposalAttachment = useDownloadProposalAttachment();
  const [localStorageValue, setLocalStorageValue] = useLocalStorage<
    Column<ProposalViewData>[] | null
  >('proposalColumnsInstrumentScientist', null);

  const isTechnicalReviewEnabled = featureContext.featuresMap.get(
    FeatureId.TECHNICAL_REVIEW
  )?.isEnabled;

  const isInstrumentManagementEnabled = featureContext.featuresMap.get(
    FeatureId.INSTRUMENT_MANAGEMENT
  )?.isEnabled;

  const isFapEnabled = featureContext.featuresMap.get(
    FeatureId.FAP_REVIEW
  )?.isEnabled;

  const instrumentScientistProposalReviewTabs = [
    PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
    ...(isTechnicalReviewEnabled
      ? [PROPOSAL_MODAL_TAB_NAMES.TECHNICAL_REVIEW]
      : []),
    ...(isFapEnabled && isInstrumentScientist
      ? [PROPOSAL_MODAL_TAB_NAMES.ADMIN]
      : []),
  ];

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: ProposalViewData) => {
    const iconButtonStyle = { padding: '7px' };
    const isCurrentUserTechnicalReviewAssignee =
      isInstrumentScientist && rowData.technicalReviewAssigneeId === user.id;

    const showView =
      rowData.technicalReviewSubmitted ||
      (isCurrentUserTechnicalReviewAssignee === false && !isInternalReviewer);

    return (
      <>
        <Tooltip
          title={
            showView
              ? 'View proposal and technical review'
              : 'Edit technical review'
          }
        >
          <IconButton
            onClick={() => {
              setUrlQueryParams({
                reviewModal: rowData.primaryKey,
                modalTab: showView
                  ? instrumentScientistProposalReviewTabs.indexOf(
                      PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION
                    )
                  : instrumentScientistProposalReviewTabs.indexOf(
                      PROPOSAL_MODAL_TAB_NAMES.TECHNICAL_REVIEW
                    ),
              });
            }}
            style={iconButtonStyle}
          >
            {showView ? (
              <Visibility data-cy="view-proposal-and-technical-review" />
            ) : (
              <Edit data-cy="edit-technical-review" />
            )}
          </IconButton>
        </Tooltip>
      </>
    );
  };

  // Bulk submit proposal reviews.
  const submitTechnicalReviews = async (
    selectedProposals: ProposalViewData[]
  ) => {
    if (selectedProposals?.length) {
      const shouldAddPluralLetter = selectedProposals.length > 1 ? 's' : '';
      const submittedTechnicalReviewsInput: SubmitTechnicalReviewInput[] =
        selectedProposals.map((proposal) => ({
          proposalPk: proposal.primaryKey,
          reviewerId: proposal.technicalReviewAssigneeId || user.id,
          submitted: true,
        }));

      await api({
        toastSuccessMessage: `Proposal${shouldAddPluralLetter} technical review submitted successfully!`,
      }).submitTechnicalReviews({
        technicalReviews: submittedTechnicalReviewsInput,
      });

      const newProposalsData = proposalsData.map((proposalData) => ({
        ...proposalData,
        technicalReviewSubmitted: selectedProposals.find(
          (selectedProposal) =>
            selectedProposal.primaryKey === proposalData.primaryKey
        )
          ? 1
          : proposalData.technicalReviewSubmitted,
      }));
      setProposalsData(newProposalsData);
    }
  };

  const handleSearchChange = (searchText: string) => {
    setQueryParameters({
      ...queryParameters,
      searchText: searchText ? searchText : undefined,
    });
    setUrlQueryParams({ search: searchText ? searchText : undefined });
  };

  const handleColumnHiddenChange = (columnChange: Column<ProposalViewData>) => {
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
  };

  const handleColumnSelectionChange = (selectedItems: ProposalViewData[]) =>
    setUrlQueryParams((params) => ({
      ...params,
      selection:
        selectedItems.length > 0
          ? selectedItems.map((selectedItem) =>
              selectedItem.primaryKey.toString()
            )
          : undefined,
    }));

  const handleColumnSortOrderChange = (
    orderedColumnId: number,
    orderDirection: 'desc' | 'asc'
  ) =>
    setUrlQueryParams({
      sortColumn: orderedColumnId >= 0 ? orderedColumnId : undefined,
      sortDirection: orderDirection ? orderDirection : undefined,
    });

  const handleDownloadActionClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setActionsMenuAnchorElement(event.currentTarget);
  };
  const handleClose = (selectedOption: string) => {
    if (selectedOption === DownloadMenuOption.PROPOSAL) {
      downloadPDFProposal(
        selectedProposals?.map((proposal) => proposal.primaryKey),
        selectedProposals?.[0].title || ''
      );
    } else if (selectedOption === DownloadMenuOption.ATTACHMENT) {
      setOpenDownloadAttachment(true);
    }
    setActionsMenuAnchorElement(null);
  };

  const handleBulkTechnicalReviewsSubmit = async () => {
    const invalid = [];

    for await (const proposal of selectedProposals) {
      const isValidSchema =
        await proposalTechnicalReviewValidationSchema.isValid({
          status: proposal.status,
          timeAllocation: proposal.technicalTimeAllocation,
        });
      if (!isValidSchema) {
        invalid.push(proposal);
      }
    }

    confirm(
      async () => {
        await submitTechnicalReviews(selectedProposals);
      },
      {
        title: 'Submit technical reviews',
        description:
          'No further changes to technical reviews are possible after submission. Are you sure you want to submit the selected proposals technical reviews?',
        alertText:
          invalid.length > 0
            ? `Some of the selected proposals are missing some required input. Please correct the status and time allocation for the proposal(s) with ID: ${invalid
                .map((proposal) => proposal.proposalId)
                .join(', ')}`
            : '',
      }
    )();
  };

  // NOTE: We are remapping only the hidden field because functions like `render` can not be stringified.
  if (localStorageValue) {
    columns = columns.map((column) => ({
      ...column,
      hidden: localStorageValue.find(
        (localStorageValueItem) => localStorageValueItem.title === column.title
      )?.hidden,
    }));
  }

  if (isTechnicalReviewEnabled) {
    addColumns(columns, technicalReviewColumns);
  } else {
    removeColumns(columns, technicalReviewColumns);
  }

  if (isInstrumentManagementEnabled) {
    addColumns(columns, instrumentManagementColumns(t));
  } else {
    removeColumns(columns, instrumentManagementColumns(t));
  }

  if (isFapEnabled) {
    addColumns(columns, FapReviewColumns);
  } else {
    removeColumns(columns, FapReviewColumns);
  }

  columns = setSortDirectionOnSortColumn(
    columns,
    urlQueryParams.sortColumn,
    urlQueryParams.sortDirection
  );

  const GetAppIconComponent = (): JSX.Element => (
    <GetAppIcon data-cy="download-proposals" />
  );
  const DoneAllIcon = (): JSX.Element => (
    <DoneAll data-cy="submit-proposal-reviews" />
  );

  const proposalToReview = preselectedProposalsData.find(
    (proposal) => proposal.primaryKey === urlQueryParams.reviewModal
  );

  /** NOTE:
   * Including the id property for https://material-table-core.com/docs/breaking-changes#id
   * Including the action buttons as property to avoid the console warning(https://github.com/material-table-core/core/issues/286)
   */
  const proposalDataWithIdAndRowActions = tableData.map((proposal) =>
    Object.assign(proposal, {
      id: proposal.primaryKey,
      rowActionButtons: RowActionButtons(proposal),
      assignedTechnicalReviewer: proposal.technicalReviewAssigneeFirstName
        ? `${proposal.technicalReviewAssigneeFirstName} ${proposal.technicalReviewAssigneeLastName}`
        : '-',
      technicalTimeAllocationRendered: proposal.technicalTimeAllocation
        ? `${proposal.technicalTimeAllocation}(${proposal.allocationTimeUnit}s)`
        : '-',
    })
  );

  const shouldShowSelectAllAction =
    totalCount >= PREFETCH_SIZE ? SELECT_ALL_ACTION_TOOLTIP : undefined;

  const allPrefetchedProposalsSelected =
    preselectedProposalsData.length === urlQueryParams.selection.length;

  const tableActions: Action<ProposalViewData>[] = [
    {
      icon: GetAppIconComponent,
      tooltip: 'Download proposals',
      onClick: handleDownloadActionClick,
      position: 'toolbarOnSelect',
    },
    {
      tooltip: shouldShowSelectAllAction,
      icon: DoneAllIcon,
      hidden: true,
      iconProps: {
        hidden: allPrefetchedProposalsSelected,
        defaultValue: preselectedProposalsData.length,
      },
      onClick: () => {
        if (allPrefetchedProposalsSelected) {
          setUrlQueryParams((params) => ({
            ...params,
            selection: undefined,
          }));
        } else {
          setUrlQueryParams((params) => ({
            ...params,
            selection: preselectedProposalsData.map((proposal) =>
              proposal.primaryKey.toString()
            ),
          }));
        }
      },
      position: 'toolbarOnSelect',
    },
  ];

  if (isInstrumentScientist) {
    tableActions.push({
      icon: DoneAllIcon,
      tooltip: 'Submit proposal reviews',
      onClick: handleBulkTechnicalReviewsSubmit,
      position: 'toolbarOnSelect',
    });
  }

  return (
    <>
      <ProposalReviewModal
        title={`View proposal: ${proposalToReview?.title} (${proposalToReview?.proposalId})`}
        proposalReviewModalOpen={!!urlQueryParams.reviewModal}
        setProposalReviewModalOpen={(updatedProposal?: Proposal) => {
          setProposalsData(
            proposalsData.map((proposal) => {
              if (proposal.primaryKey === updatedProposal?.primaryKey) {
                return {
                  ...proposal,
                  technicalReviewAssigneeId:
                    updatedProposal.technicalReview
                      ?.technicalReviewAssigneeId || null,
                  technicalReviewAssigneeFirstName:
                    updatedProposal.technicalReview?.technicalReviewAssignee
                      ?.firstname || null,
                  technicalReviewAssigneeLastName:
                    updatedProposal.technicalReview?.technicalReviewAssignee
                      ?.lastname || null,
                  technicalReviewSubmitted: updatedProposal.technicalReview
                    ?.submitted
                    ? 1
                    : 0,
                  technicalStatus:
                    updatedProposal.technicalReview?.status || '',
                  technicalTimeAllocation:
                    updatedProposal.technicalReview?.timeAllocation || null,
                };
              } else {
                return proposal;
              }
            })
          );
          setUrlQueryParams({ reviewModal: undefined, modalTab: undefined });
        }}
        reviewItemId={urlQueryParams.reviewModal}
      >
        <ProposalReviewContent
          proposalPk={urlQueryParams.reviewModal as number}
          tabNames={instrumentScientistProposalReviewTabs}
        />
      </ProposalReviewModal>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openDownloadAttachment}
        onClose={(): void => setOpenDownloadAttachment(false)}
      >
        <DialogContent>
          <ProposalAttachmentDownload
            close={(): void => setOpenDownloadAttachment(false)}
            referenceNumbers={selectedProposals.map(
              (selectedProposal) => selectedProposal.proposalId
            )}
            downloadProposalAttachment={(
              proposalIds: number[],
              questionIds: string
            ) =>
              downloadProposalAttachment(proposalIds, {
                questionIds,
              })
            }
          />
        </DialogContent>
      </Dialog>
      <TableActionsDropdownMenu
        event={actionsMenuAnchorElement}
        handleClose={handleClose}
        options={Object.values(DownloadMenuOption)}
      />
      {isInstrumentScientist && (
        <>
          <ReviewerFilterComponent
            reviewer={urlQueryParams.reviewer}
            onChange={(reviewer) =>
              setProposalFilter({ ...proposalFilter, reviewer })
            }
          />
          <ProposalFilterBar
            calls={{ data: calls, isLoading: loadingCalls }}
            instruments={{ data: instruments, isLoading: loadingInstruments }}
            proposalStatuses={{
              data: proposalStatuses,
              isLoading: loadingProposalStatuses,
            }}
            setProposalFilter={setProposalFilter}
            filter={proposalFilter}
          />
        </>
      )}
      <MaterialTable
        icons={tableIcons}
        title={'Proposals'}
        components={{
          Toolbar: ToolbarWithSelectAllPrefetched,
        }}
        onPageChange={(page, pageSize) => {
          const newOffset =
            Math.floor((pageSize * page) / PREFETCH_SIZE) * PREFETCH_SIZE;
          if (
            page !== currentPage &&
            newOffset != queryParameters.query.offset
          ) {
            setQueryParameters({
              searchText: queryParameters.searchText,
              query: {
                ...queryParameters.query,
                offset: newOffset,
              },
            });
          }
          setCurrentPage(page);
        }}
        columns={columns}
        data={proposalDataWithIdAndRowActions}
        totalCount={totalCount}
        page={currentPage}
        localization={{
          toolbar: {
            nRowsSelected: `${urlQueryParams.selection.length} row(s) selected`,
          },
        }}
        onRowsPerPageChange={(rowsPerPage) => setRowsPerPage(rowsPerPage)}
        isLoading={loading}
        options={{
          search: true,
          searchText: urlQueryParams.search || undefined,
          selection: true,
          headerSelectionProps: {
            inputProps: { 'aria-label': 'Select All Rows' },
          },
          debounceInterval: 400,
          columnsButton: true,
          selectionProps: (rowData: ProposalViewData) => ({
            inputProps: {
              'aria-label': `${rowData.title}-select`,
            },
          }),
          pageSize: 20,
        }}
        onSearchChange={handleSearchChange}
        onChangeColumnHidden={handleColumnHiddenChange}
        onSelectionChange={handleColumnSelectionChange}
        onOrderChange={handleColumnSortOrderChange}
        actions={tableActions}
      />
    </>
  );
};

export default withConfirm(ProposalTableInstrumentScientist);
