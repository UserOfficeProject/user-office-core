import {
  Action,
  Column,
  MTableToolbar,
  OrderByCollection,
} from '@material-table/core';
import DoneAll from '@mui/icons-material/DoneAll';
import Edit from '@mui/icons-material/Edit';
import GetAppIcon from '@mui/icons-material/GetApp';
import Visibility from '@mui/icons-material/Visibility';
import { Box, Button, Dialog, DialogContent, Grid } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { proposalTechnicalReviewValidationSchema } from '@user-office-software/duo-validation';
import { TFunction } from 'i18next';
import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import MaterialTable from 'components/common/DenseMaterialTable';
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
  ProposalViewTechnicalReviewAssignee,
} from 'generated/sdk';
import { useInstrumentScientistCallsData } from 'hooks/call/useInstrumentScientistCallsData';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
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
  fromArrayToCommaSeparated,
  removeColumns,
  setSortDirectionOnSortField,
} from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import ProposalAttachmentDownload from './ProposalAttachmentDownload';
import ProposalFilterBar, {
  questionaryFilterFromUrlQuery,
} from './ProposalFilterBar';
import TableActionsDropdownMenu, {
  DownloadMenuOption,
  PdfDownloadMenuOption,
} from './TableActionsDropdownMenu';

type QueryParameters = {
  query: {
    first?: number;
    offset?: number;
  };
  searchText?: string | undefined;
};

const currentPage = 0;

const getFilterReviewer = (selected: string | ReviewerFilter) =>
  selected === ReviewerFilter.ME ? ReviewerFilter.ME : ReviewerFilter.ALL;

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
        proposalView.principalInvestigator?.preferredname
      ) {
        return `${proposalView.principalInvestigator.lastname}, ${proposalView.principalInvestigator.preferredname}`;
      } else if (
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
    field: 'technicalStatuses',
    render: (rowData: ProposalViewData) =>
      fromArrayToCommaSeparated(
        rowData.technicalReviews?.map((tr) => tr.status)
      ),
  },
  {
    title: 'Technical time allocation',
    field: 'technicalTimeAllocations',
    render: (rowData: ProposalViewData) =>
      `${fromArrayToCommaSeparated(
        rowData.technicalReviews?.map((tr) => tr.timeAllocation)
      )} (${rowData.allocationTimeUnit}s)`,
  },
  {
    title: 'Assigned technical reviewer',
    field: 'technicalReviewAssigneeNames',
    render: (rowData: ProposalViewData) =>
      fromArrayToCommaSeparated(
        rowData.technicalReviews?.map((tr) =>
          getFullUserName(tr.technicalReviewAssignee)
        )
      ),
  },
];

const instrumentManagementColumns = (
  t: TFunction<'translation', undefined>
) => [
  {
    title: t('instrument'),
    field: 'instrumentNames',
    render: (rowData: ProposalViewData) =>
      fromArrayToCommaSeparated(rowData.instruments?.map((i) => i.name)),
  },
];

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
  selectedCount: number;
  dataManager: { data: ProposalViewData[] };
}) => {
  const selectAllAction = props.actions.find(
    (action) => action.hidden && action.tooltip === SELECT_ALL_ACTION_TOOLTIP
  );
  const tableHasData = !!props.dataManager.data.length;
  const allItemsSelectedOnThePage =
    props.selectedCount === props.dataManager.data.length;

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
                onClick={() =>
                  selectAllAction.onClick(null, props.dataManager.data)
                }
                data-cy="clear-all-selection"
              >
                Clear selection
              </Button>
            </>
          ) : (
            <>
              All {props.selectedCount} proposals on this page are selected.
              <Button
                variant="text"
                onClick={() =>
                  selectAllAction.onClick(null, props.dataManager.data)
                }
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

  const [searchParams, setSearchParams] = useSearchParams();
  const callId = searchParams.get('call');
  const instrumentId = searchParams.get('instrument');
  const proposalStatusId = searchParams.get('proposalStatus');
  const questionId = searchParams.get('questionId');
  const proposalId = searchParams.get('proposalId');
  const compareOperator = searchParams.get('compareOperator');
  const value = searchParams.get('value');
  const dataType = searchParams.get('dataType');
  const reviewer = searchParams.get('reviewer');
  const search = searchParams.get('search');
  const selection = searchParams.get('selection');
  const sortField = searchParams.get('sortField');
  const sortDirection = searchParams.get('sortDirection');
  const reviewModal = searchParams.get('reviewModal');

  // NOTE: proposalStatusId has default value 2 because for Instrument Scientist default view should be all proposals in FEASIBILITY_REVIEW status
  const [proposalFilter, setProposalFilter] = useState<ProposalsFilter>({
    callId: callId ? +callId : undefined,
    instrumentFilter: {
      instrumentId: instrumentId != null ? +instrumentId : null,
      showAllProposals: !instrumentId,
      showMultiInstrumentProposals: false,
    },
    proposalStatusId: proposalStatusId ? +proposalStatusId : undefined,
    referenceNumbers: proposalId ? [proposalId] : undefined,
    excludeProposalStatusIds: [9],
    questionFilter: questionaryFilterFromUrlQuery({
      compareOperator,
      dataType,
      questionId,
      value,
    }),
    reviewer: getFilterReviewer(reviewer ?? ReviewerFilter.ALL),
  });
  const [queryParameters, setQueryParameters] = useState<QueryParameters>({
    query: {
      first: PREFETCH_SIZE,
      offset: 0,
    },
    searchText: search ?? undefined,
  });
  const { instruments, loadingInstruments } = useInstrumentsData();
  const { calls, loadingCalls } = useInstrumentScientistCallsData(user.id);
  const { proposalStatuses, loadingProposalStatuses } =
    useProposalStatusesData();

  const { loading, proposalsData, totalCount, setProposalsData } =
    useProposalsCoreData(
      {
        proposalStatusId: proposalFilter.proposalStatusId,
        excludeProposalStatusIds: proposalFilter.excludeProposalStatusIds,
        instrumentFilter: proposalFilter.instrumentFilter,
        callId: proposalFilter.callId,
        questionFilter: proposalFilter.questionFilter,
        reviewer: proposalFilter.reviewer,
        referenceNumbers: proposalFilter.referenceNumbers,
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
    if (isMounted) {
      setTableData(
        preselectedProposalsData.slice(
          (currentPage * rowsPerPage) % PREFETCH_SIZE,
          totalCount
        )
      );
    }

    return () => {
      isMounted = false;
    };
  }, [rowsPerPage, preselectedProposalsData, queryParameters, totalCount]);

  useEffect(() => {
    if (selection && selection.length > 0) {
      const selectionSet = new Set(selection);
      const selected: ProposalViewData[] = [];
      setPreselectedProposalsData(
        proposalsData.map((proposal) => {
          if (selectionSet.has(proposal.primaryKey.toString())) {
            selected.push(proposal);
          }

          return {
            ...proposal,
            tableData: {
              checked: selectionSet.has(proposal.primaryKey.toString()),
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
  }, [proposalsData, selection]);

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
      isInstrumentScientist &&
      rowData.technicalReviews
        ?.map((tr) => tr.technicalReviewAssignee?.id)
        .includes(user.id);

    const showView =
      rowData.technicalReviews?.every((tr) => tr.submitted) ||
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
              setSearchParams((searchParam) => {
                searchParam.set('reviewModal', rowData.primaryKey.toString());
                searchParam.set(
                  'modalTab',
                  showView
                    ? instrumentScientistProposalReviewTabs
                        .indexOf(PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION)
                        .toString()
                    : instrumentScientistProposalReviewTabs
                        .indexOf(PROPOSAL_MODAL_TAB_NAMES.TECHNICAL_REVIEW)
                        .toString()
                );

                return searchParam;
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
      const submittedTechnicalReviewsInput: SubmitTechnicalReviewInput[] = [];
      selectedProposals.forEach((proposal) => {
        if (proposal.instruments) {
          proposal.instruments.forEach((i) => {
            if (i.id) {
              submittedTechnicalReviewsInput.push({
                proposalPk: proposal.primaryKey,
                reviewerId: user.id,
                submitted: true,
                instrumentId: i.id,
              });
            }
          });
        }
      });

      await api({
        toastSuccessMessage: `Proposal${shouldAddPluralLetter} technical review submitted successfully!`,
      }).submitTechnicalReviews({
        technicalReviews: submittedTechnicalReviewsInput,
      });

      const newProposalsData = proposalsData.map((proposalData) => ({
        ...proposalData,
        technicalReviews:
          proposalData.technicalReviews?.map((tr) => ({
            ...tr,
            submitted: selectedProposals.find(
              (selectedProposal) =>
                selectedProposal.primaryKey === proposalData.primaryKey
            )
              ? true
              : tr.submitted,
          })) || [],
      }));
      setProposalsData(newProposalsData);
    }
  };

  const handleSearchChange = (searchText: string) => {
    setQueryParameters({
      ...queryParameters,
      searchText: searchText ? searchText : undefined,
    });

    setSearchParams((searchParam) => {
      searchParam.delete('search');

      if (searchText) searchParam.set('search', searchText);

      return searchParam;
    });
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

  const handleColumnSelectionChange = (selectedItems: ProposalViewData[]) => {
    setSearchParams((searchParam) => {
      searchParam.delete('selection');
      selectedItems.map((selectedItem) =>
        searchParam.append('selection', selectedItem.primaryKey.toString())
      );

      return searchParam;
    });
  };

  const handleColumnSortOrderChange = (
    orderByCollection: OrderByCollection[]
  ) => {
    const [orderBy] = orderByCollection;
    setSearchParams((searchParam) => {
      searchParam.delete('sortField');
      searchParam.delete('sortDirection');

      if (orderBy?.orderByField != null && orderBy?.orderDirection != null) {
        searchParam.set('sortField', orderBy?.orderByField);
        searchParam.set('sortDirection', orderBy?.orderDirection);
      }

      return searchParam;
    });
  };

  const handleDownloadActionClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setActionsMenuAnchorElement(event.currentTarget);
  };
  const handleClose = (selectedOption: string) => {
    if (selectedOption === PdfDownloadMenuOption.PDF) {
      downloadPDFProposal(
        selectedProposals?.map((proposal) => proposal.primaryKey),
        selectedProposals?.[0].title || ''
      );
    } else if (selectedOption === PdfDownloadMenuOption.ZIP) {
      downloadPDFProposal(
        selectedProposals?.map((proposal) => proposal.primaryKey),
        selectedProposals?.[0].title || '',
        'zip'
      );
    } else if (selectedOption === DownloadMenuOption.ATTACHMENT) {
      setOpenDownloadAttachment(true);
    }
    setActionsMenuAnchorElement(null);
  };

  const handleBulkTechnicalReviewsSubmit = async () => {
    const invalid = [];

    for await (const proposal of selectedProposals) {
      const { technicalReviews } = proposal;
      if (technicalReviews?.length) {
        const isValidSchema = (
          await Promise.all(
            technicalReviews.map(
              async (tr) =>
                await proposalTechnicalReviewValidationSchema.isValid({
                  status: tr.status,
                  timeAllocation: tr.timeAllocation,
                })
            )
          )
        ).every(Boolean);

        if (!isValidSchema) {
          invalid.push(proposal);
        }
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
  columns = setSortDirectionOnSortField(columns, sortField, sortDirection);

  const GetAppIconComponent = (): JSX.Element => (
    <GetAppIcon data-cy="download-proposals" />
  );
  const DoneAllIcon = (): JSX.Element => (
    <DoneAll data-cy="submit-proposal-reviews" />
  );

  const proposalToReview = preselectedProposalsData.find(
    (proposal) =>
      (reviewModal && proposal.primaryKey === +reviewModal) ||
      proposal.proposalId === proposalId
  );

  /** NOTE:
   * Including the id property for https://material-table-core.com/docs/breaking-changes#id
   * Including the action buttons as property to avoid the console warning(https://github.com/material-table-core/core/issues/286)
   */
  const proposalDataWithIdAndRowActions = tableData.map((proposal) =>
    Object.assign(proposal, {
      id: proposal.primaryKey,
      rowActionButtons: RowActionButtons(proposal),
    })
  );

  const shouldShowSelectAllAction =
    totalCount >= PREFETCH_SIZE ? SELECT_ALL_ACTION_TOOLTIP : undefined;

  const allPrefetchedProposalsSelected =
    preselectedProposalsData.length === (selection ? selection.length : 0);

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
          setSearchParams((searchParam) => {
            searchParam.delete('selection');

            return searchParam;
          });
        } else {
          setSearchParams((searchParam) => {
            searchParam.delete('selection');
            preselectedProposalsData.map((proposal) =>
              searchParam.append('selection', proposal.primaryKey.toString())
            );

            return searchParam;
          });
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
        proposalReviewModalOpen={!!proposalToReview}
        setProposalReviewModalOpen={(updatedProposal?: Proposal) => {
          setProposalsData(
            proposalsData.map((proposal) => {
              if (proposal.primaryKey === updatedProposal?.primaryKey) {
                return {
                  ...proposal,
                  technicalReviews: updatedProposal.technicalReviews.map(
                    (technicalReview) => {
                      const technicalReviewAssignee =
                        technicalReview.technicalReviewAssignee as ProposalViewTechnicalReviewAssignee;

                      return {
                        id: technicalReview.id,
                        status: technicalReview.status,
                        submitted: technicalReview.submitted,
                        timeAllocation: technicalReview.timeAllocation,
                        technicalReviewAssignee: technicalReviewAssignee,
                      };
                    }
                  ),
                };
              } else {
                return proposal;
              }
            })
          );
          if (proposalId) {
            setProposalFilter({
              ...proposalFilter,
              referenceNumbers: undefined,
            });

            setSearchParams((searchParam) => {
              searchParam.delete('proposalId');

              return searchParam;
            });
          }

          setSearchParams((searchParam) => {
            searchParam.delete('reviewModal');
            searchParam.delete('modalTab');

            return searchParam;
          });
        }}
        reviewItemId={proposalToReview?.primaryKey}
      >
        <ProposalReviewContent
          proposalPk={proposalToReview?.primaryKey as number}
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
      />
      {isInstrumentScientist && (
        <Grid container spacing={2}>
          <Grid item sm={2} xs={12}>
            <ReviewerFilterComponent
              reviewer={reviewer ?? ReviewerFilter.ALL}
              onChange={(reviewer) =>
                setProposalFilter({ ...proposalFilter, reviewer })
              }
            />
          </Grid>
          <Grid item sm={10} xs={12}>
            <ProposalFilterBar
              calls={{ data: calls, isLoading: loadingCalls }}
              instruments={{ data: instruments, isLoading: loadingInstruments }}
              proposalStatuses={{
                data: proposalStatuses,
                isLoading: loadingProposalStatuses,
              }}
              setProposalFilter={setProposalFilter}
              filter={proposalFilter}
              hiddenStatuses={
                proposalFilter.excludeProposalStatusIds as number[]
              }
            />
          </Grid>
        </Grid>
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
        }}
        columns={columns}
        data={proposalDataWithIdAndRowActions}
        totalCount={totalCount}
        page={currentPage}
        localization={{
          toolbar: {
            nRowsSelected: `${selection ? selection.length : 0} row(s) selected`,
          },
        }}
        onRowsPerPageChange={(rowsPerPage) => setRowsPerPage(rowsPerPage)}
        isLoading={loading}
        options={{
          search: true,
          searchText: search || undefined,
          selection: true,
          headerSelectionProps: {
            inputProps: { 'aria-label': 'Select All Rows' },
          },
          debounceInterval: 600,
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
        onOrderCollectionChange={handleColumnSortOrderChange}
        actions={tableActions}
      />
    </>
  );
};

export default withConfirm(ProposalTableInstrumentScientist);
