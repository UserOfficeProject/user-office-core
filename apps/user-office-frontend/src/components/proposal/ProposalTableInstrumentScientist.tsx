import MaterialTable, { Action, Column } from '@material-table/core';
import DoneAll from '@mui/icons-material/DoneAll';
import Edit from '@mui/icons-material/Edit';
import GetAppIcon from '@mui/icons-material/GetApp';
import Visibility from '@mui/icons-material/Visibility';
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

import ProposalFilterBar, {
  questionaryFilterFromUrlQuery,
} from './ProposalFilterBar';

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

const SEPReviewColumns = (
  t: TFunction<'translation', undefined, 'translation'>
) => [
  { title: 'Final status', field: 'finalStatus', emptyValue: '-' },
  { title: t('SEP'), field: 'sepCode', emptyValue: '-', hidden: true },
];

const proposalStatusFilter: Record<string, number> = {
  ALL: 0,
  FEASIBILITY_REVIEW: 2,
};

const ProposalTableInstrumentScientist = ({
  confirm,
}: {
  confirm: WithConfirmType;
}) => {
  const { user } = useContext(UserContext);
  const featureContext = useContext(FeatureContext);
  const { api } = useDataApiWithFeedback();
  const { settingsMap } = useContext(SettingsContext);
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
  const { instruments, loadingInstruments } = useInstrumentsData();
  const { calls, loadingCalls } = useInstrumentScientistCallsData(user.id);
  const { proposalStatuses, loadingProposalStatuses } =
    useProposalStatusesData();

  const { loading, proposalsData, setProposalsData } = useProposalsCoreData({
    proposalStatusId: proposalFilter.proposalStatusId,
    instrumentId: proposalFilter.instrumentId,
    callId: proposalFilter.callId,
    questionFilter: proposalFilter.questionFilter,
    reviewer: proposalFilter.reviewer,
  });

  const [preselectedProposalsData, setPreselectedProposalsData] = useState<
    ProposalViewData[]
  >([]);

  useEffect(() => {
    if (urlQueryParams.selection.length > 0) {
      const selection = new Set(urlQueryParams.selection);

      setPreselectedProposalsData(
        proposalsData.map((proposal) => ({
          ...proposal,
          tableData: {
            checked: selection.has(proposal.primaryKey.toString()),
          },
        }))
      );
    } else {
      setPreselectedProposalsData(
        proposalsData.map((proposal) => ({
          ...proposal,
          tableData: { checked: false },
        }))
      );
    }
  }, [proposalsData, urlQueryParams.selection]);

  const downloadPDFProposal = useDownloadPDFProposal();
  const [localStorageValue, setLocalStorageValue] = useLocalStorage<
    Column<ProposalViewData>[] | null
  >('proposalColumnsInstrumentScientist', null);

  const isTechnicalReviewEnabled = featureContext.featuresMap.get(
    FeatureId.TECHNICAL_REVIEW
  )?.isEnabled;

  const isInstrumentManagementEnabled = featureContext.featuresMap.get(
    FeatureId.INSTRUMENT_MANAGEMENT
  )?.isEnabled;

  const isSEPEnabled = featureContext.featuresMap.get(
    FeatureId.SEP_REVIEW
  )?.isEnabled;

  const instrumentScientistProposalReviewTabs = [
    PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
    ...(isTechnicalReviewEnabled
      ? [PROPOSAL_MODAL_TAB_NAMES.TECHNICAL_REVIEW]
      : []),
    ...(isSEPEnabled && isInstrumentScientist
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

  const handleSearchChange = (searchText: string) =>
    setUrlQueryParams({ search: searchText ? searchText : undefined });

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

  const handleBulkDownloadClick = (
    _: React.MouseEventHandler<HTMLButtonElement>,
    rowData: ProposalViewData | ProposalViewData[]
  ) => {
    if (!Array.isArray(rowData)) {
      return;
    }

    downloadPDFProposal(
      rowData.map((row) => row.primaryKey),
      rowData[0].title
    );
  };

  const handleBulkTechnicalReviewsSubmit = async (
    _: React.MouseEventHandler<HTMLButtonElement>,
    selectedRowsData: ProposalViewData | ProposalViewData[]
  ) => {
    if (!Array.isArray(selectedRowsData)) {
      return;
    }

    const invalid = [];

    for await (const rowData of selectedRowsData) {
      const isValidSchema =
        await proposalTechnicalReviewValidationSchema.isValid({
          status: rowData.status,
          timeAllocation: rowData.technicalTimeAllocation,
        });
      if (!isValidSchema) {
        invalid.push(rowData);
      }
    }

    confirm(
      async () => {
        await submitTechnicalReviews(selectedRowsData);
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

  if (isSEPEnabled) {
    addColumns(columns, SEPReviewColumns(t));
  } else {
    removeColumns(columns, SEPReviewColumns(t));
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
  const proposalDataWithIdAndRowActions = preselectedProposalsData.map(
    (proposal) =>
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

  const tableActions: Action<ProposalViewData>[] = [
    {
      icon: GetAppIconComponent,
      tooltip: 'Download proposals',
      onClick: handleBulkDownloadClick,
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
        columns={columns}
        data={proposalDataWithIdAndRowActions}
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
