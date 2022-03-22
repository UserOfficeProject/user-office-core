import MaterialTable, { Column } from '@material-table/core';
import Edit from '@mui/icons-material/Edit';
import GetAppIcon from '@mui/icons-material/GetApp';
import Visibility from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import {
  getTranslation,
  ResourceId,
} from '@user-office-software/duo-localisation';
import React, { useContext } from 'react';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

import { DefaultQueryParams } from 'components/common/SuperMaterialTable';
import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import { UserContext } from 'context/UserContextProvider';
import { Proposal, ProposalsFilter } from 'generated/sdk';
import { useInstrumentScientistCallsData } from 'hooks/call/useInstrumentScientistCallsData';
import { useLocalStorage } from 'hooks/common/useLocalStorage';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import {
  ProposalViewData,
  useProposalsCoreData,
} from 'hooks/proposal/useProposalsCoreData';
import { useProposalStatusesData } from 'hooks/settings/useProposalStatusesData';
import { setSortDirectionOnSortColumn } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';

import ProposalFilterBar, {
  questionaryFilterFromUrlQuery,
} from './ProposalFilterBar';
import { ProposalUrlQueryParamsType } from './ProposalPage';

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
    title: 'Time allocation',
    render: (rowData) =>
      `${rowData.technicalTimeAllocation ?? 0} (${
        rowData.allocationTimeUnit
      }s)`,
    hidden: false,
  },
  {
    title: 'Technical status',
    render: (rowData) => rowData.technicalStatus,
  },
  {
    title: 'Submitted',
    render: (rowData) => (rowData.submitted ? 'Yes' : 'No'),
  },
  { title: 'Status', field: 'statusName' },
  {
    title: 'Final Status',
    field: 'finalStatus',
    render: (rowData: ProposalViewData): string =>
      rowData.finalStatus
        ? getTranslation(rowData.finalStatus as ResourceId)
        : '',
  },
  {
    title: 'Instrument',
    field: 'instrumentName',
    emptyValue: '-',
  },
  {
    title: 'Call',
    field: 'callShortCode',
    emptyValue: '-',
    hidden: true,
  },
  {
    title: 'SEP',
    field: 'sepCode',
    emptyValue: '-',
    hidden: true,
  },
];

const ProposalTableInstrumentScientist: React.FC = () => {
  const { user } = useContext(UserContext);
  const [urlQueryParams, setUrlQueryParams] =
    useQueryParams<ProposalUrlQueryParamsType>({
      call: NumberParam,
      instrument: NumberParam,
      proposalStatus: NumberParam,
      questionId: StringParam,
      compareOperator: StringParam,
      value: StringParam,
      dataType: StringParam,
      reviewModal: NumberParam,
      ...DefaultQueryParams,
    });
  // NOTE: proposalStatusId has default value 2 because for Instrument Scientist default view should be all proposals in FEASIBILITY_REVIEW status
  const [proposalFilter, setProposalFilter] = React.useState<ProposalsFilter>({
    callId: urlQueryParams.call,
    instrumentId: urlQueryParams.instrument,
    proposalStatusId: urlQueryParams.proposalStatus || 2,
    questionFilter: questionaryFilterFromUrlQuery(urlQueryParams),
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
  });

  const downloadPDFProposal = useDownloadPDFProposal();
  const [localStorageValue, setLocalStorageValue] = useLocalStorage<
    Column<ProposalViewData>[] | null
  >('proposalColumnsInstrumentScientist', null);

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: ProposalViewData) => {
    const iconButtonStyle = { padding: '7px' };
    const isCurrentUserTechnicalReviewAssignee =
      rowData.technicalReviewAssignee === user.id;

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
              setUrlQueryParams({ reviewModal: rowData.primaryKey });
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

        <Tooltip title="Download proposal as PDF">
          <IconButton
            data-cy="download-proposal"
            onClick={() =>
              downloadPDFProposal([rowData.primaryKey], rowData.title)
            }
            style={iconButtonStyle}
          >
            <GetAppIcon />
          </IconButton>
        </Tooltip>
      </>
    );
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

  columns = setSortDirectionOnSortColumn(
    columns,
    urlQueryParams.sortColumn,
    urlQueryParams.sortDirection
  );

  const GetAppIconComponent = (): JSX.Element => <GetAppIcon />;

  const proposalToReview = proposalsData.find(
    (proposal) => proposal.primaryKey === urlQueryParams.reviewModal
  );

  const instrumentScientistProposalReviewTabs = [
    PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
    PROPOSAL_MODAL_TAB_NAMES.TECHNICAL_REVIEW,
  ];

  /** NOTE:
   * Including the id property for https://material-table-core.com/docs/breaking-changes#id
   * Including the action buttons as property to avoid the console warning(https://github.com/material-table-core/core/issues/286)
   */
  const proposalDataWithIdAndRowActions = proposalsData.map((proposal) =>
    Object.assign(proposal, {
      id: proposal.primaryKey,
      rowActionButtons: RowActionButtons(proposal),
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
                return Object.assign(
                  proposal,
                  updatedProposal
                ) as ProposalViewData;
              } else {
                return proposal;
              }
            })
          );
          setUrlQueryParams({ reviewModal: undefined });
        }}
        reviewItemId={urlQueryParams.reviewModal}
      >
        <ProposalReviewContent
          proposalPk={urlQueryParams.reviewModal as number}
          tabNames={instrumentScientistProposalReviewTabs}
        />
      </ProposalReviewModal>
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
        onSearchChange={(searchText) => {
          setUrlQueryParams({ search: searchText ? searchText : undefined });
        }}
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
        actions={[
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
        ]}
      />
    </>
  );
};

export default ProposalTableInstrumentScientist;
