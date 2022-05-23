import MaterialTable, { Column } from '@material-table/core';
import DoneAll from '@mui/icons-material/DoneAll';
import Edit from '@mui/icons-material/Edit';
import GetAppIcon from '@mui/icons-material/GetApp';
import Visibility from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { proposalTechnicalReviewValidationSchema } from '@user-office-software/duo-validation';
import React, { useContext, useState, useEffect } from 'react';
import {
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

import { DefaultQueryParams } from 'components/common/SuperMaterialTable';
import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import ReviewerFilterComponent, {
  defaultReviewerQueryFilter,
} from 'components/review/ReviewerFilter';
import { FeatureContext } from 'context/FeatureContextProvider';
import { UserContext } from 'context/UserContextProvider';
import {
  FeatureId,
  Proposal,
  ProposalsFilter,
  ReviewerFilter,
  SubmitTechnicalReviewInput,
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

const instrumentManagementColumns = [
  { title: 'Instrument', field: 'instrumentName', emptyValue: '-' },
];

const SEPReviewColumns = [
  { title: 'Final status', field: 'finalStatus', emptyValue: '-' },
  { title: 'SEP', field: 'sepCode', emptyValue: '-', hidden: true },
];

const ProposalTableInstrumentScientist: React.FC<{
  confirm: WithConfirmType;
}> = ({ confirm }) => {
  const { user } = useContext(UserContext);
  const featureContext = useContext(FeatureContext);
  const { api } = useDataApiWithFeedback();
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    ...DefaultQueryParams,
    call: NumberParam,
    instrument: NumberParam,
    proposalStatus: withDefault(NumberParam, 2),
    questionId: StringParam,
    compareOperator: StringParam,
    value: StringParam,
    dataType: StringParam,
    reviewModal: NumberParam,
    modalTab: NumberParam,
    reviewer: defaultReviewerQueryFilter,
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
  ];

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: ProposalViewData) => {
    const iconButtonStyle = { padding: '7px' };
    const isCurrentUserTechnicalReviewAssignee =
      rowData.technicalReviewAssigneeId === user.id;

    const showView =
      rowData.technicalReviewSubmitted ||
      isCurrentUserTechnicalReviewAssignee === false;

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

      const result = await api({
        toastSuccessMessage: `Proposal${shouldAddPluralLetter} technical review submitted successfully!`,
      }).submitTechnicalReviews({
        technicalReviews: submittedTechnicalReviewsInput,
      });

      const isError = !!result.submitTechnicalReviews.rejection;

      if (!isError) {
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
    addColumns(columns, instrumentManagementColumns);
  } else {
    removeColumns(columns, instrumentManagementColumns);
  }

  if (isSEPEnabled) {
    addColumns(columns, SEPReviewColumns);
  } else {
    removeColumns(columns, SEPReviewColumns);
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
        actions={[
          {
            icon: GetAppIconComponent,
            tooltip: 'Download proposals',
            onClick: handleBulkDownloadClick,
            position: 'toolbarOnSelect',
          },
          {
            icon: DoneAllIcon,
            tooltip: 'Submit proposal reviews',
            onClick: handleBulkTechnicalReviewsSubmit,
            position: 'toolbarOnSelect',
          },
        ]}
      />
    </>
  );
};

export default withConfirm(ProposalTableInstrumentScientist);
