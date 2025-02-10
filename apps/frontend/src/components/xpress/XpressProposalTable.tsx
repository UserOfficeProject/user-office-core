import MaterialTableCore, {
  Column,
  OrderByCollection,
  Query,
  QueryResult,
} from '@material-table/core';
import { Info, Visibility } from '@mui/icons-material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import GridOnIcon from '@mui/icons-material/GridOn';
import {
  FormControl,
  MenuItem,
  Select,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  getTranslation,
  ResourceId,
} from '@user-office-software/duo-localisation';
import i18n from 'i18n';
import { t, TFunction } from 'i18next';
import React, { useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import UOLoader from 'components/common/UOLoader';
import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import { UserContext } from 'context/UserContextProvider';
import {
  ProposalsFilter,
  SettingsId,
  UserRole,
  WorkflowType,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { CallsDataQuantity, useCallsData } from 'hooks/call/useCallsData';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useDownloadXLSXProposal } from 'hooks/proposal/useDownloadXLSXProposal';
import { ProposalViewData } from 'hooks/proposal/useProposalsCoreData';
import { useStatusesData } from 'hooks/settings/useStatusesData';
import { useXpressTechniquesData } from 'hooks/technique/useXpressTechniquesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import {
  addColumns,
  fromArrayToCommaSeparated,
  setSortDirectionOnSortField,
} from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import ProposalScientistComment from './ProposalScientistComment';
import { useXpressInstrumentsData } from './useXpressInstrumentsData';
import XpressNotice from './XpressNotice';
import XpressProposalFilterBar from './XpressProposalFilterBar';

const XpressProposalTable = ({ confirm }: { confirm: WithConfirmType }) => {
  const tableRef = React.useRef<MaterialTableCore<ProposalViewData>>();
  const refreshTableData = () => {
    tableRef.current?.onQueryChange({});
  };

  const [tableData, setTableData] = useState<ProposalViewData[]>([]);

  const {
    statuses: proposalStatuses,
    loadingStatuses: loadingProposalStatuses,
  } = useStatusesData(WorkflowType.PROPOSAL);

  // Only show calls that use the quick review workflow status
  const { calls, loadingCalls } = useCallsData(
    {
      proposalStatusShortCode: 'QUICK_REVIEW',
    },
    CallsDataQuantity.MINIMAL
  );

  // Only show techniques that the user is assigned to
  const { techniques, loadingTechniques } = useXpressTechniquesData();

  // Only show instruments in the user's techniques
  const { instruments, loadingInstruments } =
    useXpressInstrumentsData(techniques);

  const [searchParams, setSearchParams] = useSearchParams({});
  const { toFormattedDateTime } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_TIME_FORMAT,
  });

  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const callId = searchParams.get('callId');
  const instrument = searchParams.get('instrument');
  const technique = searchParams.get('technique');
  const proposalId = searchParams.get('proposalId');
  const to = searchParams.get('to');
  const from = searchParams.get('from');
  const proposalStatusId = searchParams.get('proposalStatusId');
  const search = searchParams.get('search');
  const selection = searchParams.getAll('selection');
  const sortField = searchParams.get('sortField');
  const sortDirection = searchParams.get('sortDirection');
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');
  const reviewModal = searchParams.get('reviewModal');

  const { api } = useDataApiWithFeedback();
  const [totalCount, setTotalCount] = useState(0);
  const allPrefetchedProposalsSelected =
    totalCount === searchParams.getAll('selection').length;
  const [allProposalSelectionLoading, setAllProposalSelectionLoading] =
    useState(false);

  const { currentRole } = useContext(UserContext);

  enum StatusCode {
    DRAFT = 'DRAFT',
    SUBMITTED_LOCKED = 'SUBMITTED_LOCKED',
    UNDER_REVIEW = 'UNDER_REVIEW',
    APPROVED = 'APPROVED',
    UNSUCCESSFUL = 'UNSUCCESSFUL',
    FINISHED = 'FINISHED',
    EXPIRED = 'EXPIRED',
  }

  const xpressStatusCodes = [
    StatusCode.DRAFT,
    StatusCode.SUBMITTED_LOCKED,
    StatusCode.UNDER_REVIEW,
    StatusCode.APPROVED,
    StatusCode.UNSUCCESSFUL,
    StatusCode.FINISHED,
    ...(currentRole === UserRole.USER_OFFICER ? [StatusCode.EXPIRED] : []),
  ];

  const xpressStatuses = proposalStatuses.filter((ps) =>
    xpressStatusCodes.includes(ps.shortCode as StatusCode)
  );

  // Use a consistent order representing the Xpress flow
  xpressStatuses.sort((a, b) => {
    return (
      xpressStatusCodes.indexOf(a.shortCode as StatusCode) -
      xpressStatusCodes.indexOf(b.shortCode as StatusCode)
    );
  });

  const excludedStatusIds = proposalStatuses
    .filter(
      (status) => !xpressStatusCodes.includes(status.shortCode as StatusCode)
    )
    .map((status) => status.id);

  const [proposalFilter, setProposalFilter] = useState<ProposalsFilter>({
    callId: callId ? +callId : undefined,
    instrumentFilter: {
      instrumentId: instrument ? +instrument : null,
      showAllProposals: !instrument,
      showMultiInstrumentProposals: false,
    },
    techniqueFilter: {
      techniqueId: technique ? +technique : null,
      showAllProposals: !technique,
      showMultiTechniqueProposals: false,
    },
    dateFilter: {
      to: to ? to : null,
      from: from ? from : null,
    },
    referenceNumbers: proposalId ? [proposalId] : undefined,
    proposalStatusId: proposalStatusId ? +proposalStatusId : undefined,
    text: search,
    excludeProposalStatusIds: excludedStatusIds,
  });

  const RowActionButtons = (rowData: ProposalViewData) => {
    const [, setSearchParams] = useSearchParams();

    return (
      <Tooltip title="View proposal">
        <IconButton
          data-cy="view-proposal"
          onClick={() => {
            setSearchParams((searchParams) => {
              searchParams.set('reviewModal', rowData.primaryKey.toString());

              return searchParams;
            });
          }}
        >
          <Visibility />
        </IconButton>
      </Tooltip>
    );
  };

  const cellStyleSpecs = {
    whiteSpace: 'nowrap',
    maxWidth: '400px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  let columns: Column<ProposalViewData>[] = [
    {
      title: 'Actions',
      cellStyle: { minWidth: 120 },
      sorting: false,
      removable: false,
      field: 'rowActionButtons',
      render: RowActionButtons,
    },
    {
      title: 'Proposal ID',
      field: 'proposalId',
    },
    {
      title: 'Title',
      field: 'title',
      ...{ width: 'auto' },
      cellStyle: cellStyleSpecs,
    },
    {
      title: 'Principal Investigator',
      field: 'principalInvestigator',
      sorting: false,
      render: (proposalView: ProposalViewData) => {
        if (proposalView.principalInvestigator?.lastname) {
          if (proposalView.principalInvestigator?.preferredname) {
            return `${proposalView.principalInvestigator.lastname}, ${proposalView.principalInvestigator.preferredname}`;
          } else if (proposalView.principalInvestigator?.firstname) {
            return `${proposalView.principalInvestigator.lastname}, ${proposalView.principalInvestigator.firstname}`;
          }
        }

        return '';
      },
      cellStyle: cellStyleSpecs,
      customFilterAndSearch: () => true,
    },
    {
      title: 'PI Email',
      field: 'principalInvestigator.email',
      sorting: false,
      emptyValue: '-',
    },
    {
      title: 'Date submitted',
      field: 'submittedDate',
      render: (proposalView: ProposalViewData) => {
        if (proposalView.submittedDate) {
          return toFormattedDateTime(proposalView.submittedDate);
        }
      },
      ...{ width: 'auto' },
    },
  ];

  const assignProposalsToInstruments = async (
    instrument: number | null,
    proposalPk: number
  ): Promise<void> => {
    if (instrument) {
      await api({
        toastSuccessMessage: `Proposal/s assigned to the selected ${i18n.format(
          t('instrument'),
          'lowercase'
        )} successfully!`,
      }).assignXpressProposalsToInstruments({
        proposalPks: [proposalPk],
        instrumentIds: [instrument],
      });
    }

    refreshTableData();
  };

  const updateProposalStatus = async (
    proposalPk: number,
    statusId: number
  ): Promise<void> => {
    await api({
      toastSuccessMessage: 'Proposal status updated successfully!',
    }).changeXpressProposalsStatus({
      statusId: statusId,
      proposalPks: [proposalPk],
    });

    refreshTableData();
  };

  const instrumentManagementColumns = (
    t: TFunction<'translation', undefined>
  ) => [
    {
      title: (
        <>
          <span>
            {t('instrument')}
            <Tooltip
              title={
                <span>
                  <p>Tips: </p>
                  <p>
                    1. Change the status of a proposal to Under Review to enable
                    experimental area selection.
                  </p>
                  <p>
                    2. Once a proposal is marked as Approved / Unsuccessful /
                    Finished, the selected experimental area cannot be changed.
                  </p>
                </span>
              }
            >
              <IconButton>
                <Info />
              </IconButton>
            </Tooltip>
          </span>
        </>
      ),
      field: 'instruments.name',
      sorting: false,
      render: (rowData: ProposalViewData) => {
        if (loadingProposalStatuses) {
          return <UOLoader style={{ marginLeft: '50%', marginTop: '20px' }} />;
        }

        const techIds = rowData.techniques?.map((technique) => technique.id);
        const instrumentList = Array.from(
          new Map(
            techniques
              .filter((technique) => techIds?.includes(technique.id))
              .flatMap((technique) => technique.instruments)
              .filter(
                (instrument) =>
                  !instrument.description.toLowerCase().includes('retired')
              )
              .map((instrument) => [instrument.id, instrument])
          ).values()
        );
        const fieldValue = rowData.instruments?.map(
          (instrument) => instrument.id
        )[0];

        const selectedValue: number | undefined = fieldValue ? fieldValue : 0;

        const selectedStatus = proposalStatuses.find(
          (ps) => ps.name === rowData.statusName
        )?.shortCode;

        const shouldBeUneditable =
          !isUserOfficer && selectedStatus !== StatusCode.UNDER_REVIEW;

        // Always show the current instrument at the top of the dropdown
        instrumentList.forEach(function (instrument, i) {
          if (fieldValue && instrument.id === fieldValue) {
            instrumentList.splice(i, 1);
            instrumentList.unshift(instrument);
          }
        });

        return shouldBeUneditable ? (
          instrumentList.find((i) => i.id === fieldValue)?.name
        ) : (
          <>
            <FormControl fullWidth>
              <Select
                id="instrument-selection"
                aria-labelledby="instrument-select-label"
                onChange={(e) => {
                  if (e.target.value) {
                    confirm(
                      () => {
                        assignProposalsToInstruments(
                          +e.target.value,
                          rowData.primaryKey
                        );
                      },
                      {
                        title: 'Change instrument',
                        description:
                          'Are you sure you want to change this instrument?',
                        confirmationText: 'Yes',
                        cancellationText: 'Cancel',
                      }
                    )();
                  }
                }}
                value={selectedValue}
                data-cy="instrument-dropdown"
              >
                {instrumentList &&
                  instrumentList.map((instrument) => (
                    <MenuItem key={instrument.id} value={instrument.id}>
                      {instrument.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </>
        );
      },
      customFilterAndSearch: () => true,
    },
  ];

  const statusColumn = () => [
    {
      title: (
        <>
          <span>
            Status
            <Tooltip
              title={
                <span>
                  <p>Tips: </p>
                  <p>
                    1. Change the status of a proposal to Under Review to enable
                    experimental area selection.
                  </p>
                  <p>
                    2. Status can be changed to Unsuccessful, or Approved after
                    an experimental area is selected.
                  </p>
                  <p>
                    3. Once a proposal is marked as Approved / Unsuccessful /
                    Finished, the selected experimental area cannot be changed.
                  </p>
                  <p>
                    4. Further status changes are not allowed once a proposal is
                    marked as Unsuccessful.
                  </p>
                  <p>
                    5. Status of Approved proposals can be changed to
                    Unsuccessful / Finished.
                  </p>
                  <p>
                    6. Finished status can be marked only for Approved
                    proposals.
                  </p>
                </span>
              }
            >
              <IconButton>
                <Info />
              </IconButton>
            </Tooltip>
          </span>
        </>
      ),
      field: 'statusName',
      sorting: false,
      render: (rowData: ProposalViewData) => {
        if (loadingProposalStatuses) {
          return <UOLoader style={{ marginLeft: '50%', marginTop: '20px' }} />;
        }

        const fieldValue = proposalStatuses.find(
          (ps) => ps.name === rowData.statusName
        );

        // Disallow setting submitted or draft status, unless user officer
        let availableStatuses;
        if (isUserOfficer) {
          availableStatuses = xpressStatuses;
        } else {
          availableStatuses = xpressStatuses.filter(
            (status) =>
              status.shortCode !== StatusCode.SUBMITTED_LOCKED &&
              status.shortCode !== StatusCode.DRAFT &&
              status.shortCode !== StatusCode.EXPIRED
          );
        }

        xpressStatuses.sort((a, b) => {
          return (
            xpressStatusCodes.indexOf(a.shortCode as StatusCode) -
            xpressStatusCodes.indexOf(b.shortCode as StatusCode)
          );
        });

        // Always show the current status at the top of the dropdown
        if (fieldValue) {
          const currentIndex = availableStatuses.findIndex(
            (status) => status.id === fieldValue.id
          );
          if (currentIndex > -1) {
            availableStatuses.splice(currentIndex, 1);
          }
          availableStatuses.unshift(fieldValue);
        }

        const isInstrumentAbsent = (rowData.instruments?.length ?? 0) === 0;

        const status = {
          isDraft: fieldValue?.shortCode === StatusCode.DRAFT,
          isSubmitted: fieldValue?.shortCode === StatusCode.SUBMITTED_LOCKED,
          isUnsuccessful: fieldValue?.shortCode === StatusCode.UNSUCCESSFUL,
          isApproved: fieldValue?.shortCode === StatusCode.APPROVED,
          isFinished: fieldValue?.shortCode === StatusCode.FINISHED,
          isExpired: fieldValue?.shortCode === StatusCode.EXPIRED,
        };

        const shouldDisableUnderReview =
          status.isApproved || status.isUnsuccessful;

        const shouldDisableApproved = status.isSubmitted || isInstrumentAbsent;

        const shouldDisableUnsuccessful = status.isSubmitted;

        const shouldDisableFinished = !status.isApproved || isInstrumentAbsent;

        const shouldBeUneditable =
          !isUserOfficer &&
          (status.isDraft ||
            status.isFinished ||
            status.isUnsuccessful ||
            status.isExpired);

        return shouldBeUneditable ? (
          fieldValue?.name
        ) : (
          <>
            <FormControl fullWidth>
              <Select
                id="status-selection"
                aria-labelledby="status-select-label"
                onChange={(e) => {
                  if (e.target.value) {
                    confirm(
                      () => {
                        updateProposalStatus(
                          rowData.primaryKey,
                          +e.target.value
                        );
                      },
                      {
                        title: 'Change status',
                        description:
                          'Are you sure you want to change this status?',
                        confirmationText: 'Yes',
                        cancellationText: 'Cancel',
                      }
                    )();
                  }
                }}
                value={fieldValue?.id}
                data-cy="status-dropdown"
              >
                {availableStatuses &&
                  availableStatuses.map((status) => (
                    <MenuItem
                      key={status.id}
                      value={status.id}
                      disabled={
                        !isUserOfficer &&
                        ((status.shortCode === StatusCode.APPROVED &&
                          shouldDisableApproved) ||
                          (status.shortCode === StatusCode.FINISHED &&
                            shouldDisableFinished) ||
                          (status.shortCode === StatusCode.UNDER_REVIEW &&
                            shouldDisableUnderReview) ||
                          (status.shortCode === StatusCode.UNSUCCESSFUL &&
                            shouldDisableUnsuccessful))
                      }
                    >
                      {status.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </>
        );
      },
      customFilterAndSearch: () => true,
    },
  ];

  const techniquesColumns = () => [
    {
      title: 'Technique',
      field: 'technique.name',
      sorting: false,
      render: (rowData: ProposalViewData) =>
        fromArrayToCommaSeparated(
          rowData.techniques?.map((technique) => technique.name)
        ),
      customFilterAndSearch: () => true,
      cellStyle: cellStyleSpecs,
    },
  ];

  addColumns(columns, instrumentManagementColumns(t));
  addColumns(columns, techniquesColumns());
  addColumns(columns, statusColumn());

  columns = setSortDirectionOnSortField(columns, sortField, sortDirection);

  const fetchRemoteProposalsData = (tableQuery: Query<ProposalViewData>) =>
    new Promise<QueryResult<ProposalViewData>>(async (resolve, reject) => {
      const [orderBy] = tableQuery.orderByCollection;
      try {
        const {
          callId,
          instrumentFilter,
          techniqueFilter,
          proposalStatusId,
          text,
          referenceNumbers,
          dateFilter,
        } = proposalFilter;

        const result: {
          proposals: ProposalViewData[] | undefined;
          totalCount: number;
        } = { proposals: undefined, totalCount: 0 };

        result.proposals = await api()
          .getTechniqueScientistProposals({
            filter: {
              callId: callId,
              instrumentFilter: instrumentFilter,
              techniqueFilter: techniqueFilter,
              proposalStatusId: proposalStatusId,
              text: text,
              referenceNumbers: referenceNumbers,
              dateFilter: dateFilter,
              excludeProposalStatusIds:
                currentRole === UserRole.INSTRUMENT_SCIENTIST ? [9] : [], // Hide expired from scientists
            },
            sortField: orderBy?.orderByField,
            sortDirection: orderBy?.orderDirection,
            first: tableQuery.pageSize,
            offset: tableQuery.page * tableQuery.pageSize,
            searchText: tableQuery.search,
          })
          .then((data) => {
            result.totalCount =
              data.techniqueScientistProposals?.totalCount || 0;

            return data.techniqueScientistProposals?.proposals.map(
              (proposal) => {
                return {
                  ...proposal,
                  status: proposal.submitted ? 'Submitted' : 'Open',
                  finalStatus: getTranslation(
                    proposal.finalStatus as ResourceId
                  ),
                } as ProposalViewData;
              }
            );
          });

        if (result.proposals === undefined) {
          return;
        }
        const tableData =
          result.proposals.map((proposal) => {
            const selection = new Set(searchParams.getAll('selection'));
            const proposalData = {
              ...proposal,
              id: proposal.proposalId,
              status: proposal.submitted ? 'Submitted' : 'Open',
              technicalReviews: proposal.technicalReviews?.map(
                (technicalReview) => ({
                  ...technicalReview,
                  status: getTranslation(technicalReview.status as ResourceId),
                })
              ),
              finalStatus: getTranslation(proposal.finalStatus as ResourceId),
            } as ProposalViewData;

            if (searchParams.getAll('selection').length > 0) {
              return {
                ...proposalData,
                tableData: {
                  checked: selection.has(proposal.primaryKey.toString()),
                },
              };
            } else {
              return proposalData;
            }
          }) || [];

        setTableData(tableData);
        setTotalCount(result?.totalCount || 0);

        resolve({
          data: tableData,
          page: tableQuery.page,
          totalCount: result.totalCount,
        });
      } catch (error) {
        reject(error);
      }
    });

  const handleSortOrderChange = (orderByCollection: OrderByCollection[]) => {
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

  const handleFilterChange = (filter: ProposalsFilter) => {
    setProposalFilter(filter);
    refreshTableData();
  };

  const handleSearchChange = (searchText: string) => {
    searchParams.set('search', searchText ? searchText : '');
    searchParams.set('page', searchText ? '0' : page || '');
  };
  const XpressTablePanelDetails = React.useCallback(
    ({ rowData }: Record<'rowData', ProposalViewData>) => {
      return <ProposalScientistComment proposalPk={rowData.primaryKey} />;
    },
    []
  );

  const ExportIcon = (): JSX.Element => <GridOnIcon />;
  const downloadXLSXProposal = useDownloadXLSXProposal();

  const fetchProposalCoreBasicData = async () => {
    const {
      callId,
      instrumentFilter,
      techniqueFilter,
      proposalStatusId,
      text,
      referenceNumbers,
      dateFilter,
      excludeProposalStatusIds,
    } = proposalFilter;

    const result: {
      proposals: ProposalViewData[] | undefined;
      totalCount: number;
    } = { proposals: undefined, totalCount: 0 };

    result.proposals = await api()
      .getTechniqueScientistProposalsBasic({
        filter: {
          callId: callId,
          instrumentFilter: instrumentFilter,
          techniqueFilter: techniqueFilter,
          proposalStatusId: proposalStatusId,
          text: text,
          referenceNumbers: referenceNumbers,
          dateFilter: dateFilter,
          ...(currentRole === UserRole.INSTRUMENT_SCIENTIST ||
          currentRole === UserRole.USER_OFFICER
            ? { excludeProposalStatusIds: excludeProposalStatusIds }
            : {}),
        },
        searchText: searchParams.get('search'),
      })
      .then((data) => {
        result.totalCount = data.techniqueScientistProposals?.totalCount || 0;

        return data.techniqueScientistProposals?.proposals.map((proposal) => {
          return {
            ...proposal,
            status: proposal.submitted ? 'Submitted' : 'Open',
            finalStatus: getTranslation(proposal.finalStatus as ResourceId),
          } as ProposalViewData;
        });
      });

    return result;
  };

  const proposalToReview = tableData.find(
    (proposal) =>
      (reviewModal != null && proposal.primaryKey === +reviewModal) ||
      (proposalId != null && proposal.proposalId === proposalId)
  );

  const userOfficerProposalReviewTabs = [
    PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
  ];

  return (
    <>
      <XpressNotice />
      <StyledContainer maxWidth={false}>
        <StyledPaper data-cy="xpress-proposals-table">
          <ProposalReviewModal
            title={`View proposal: ${proposalToReview?.title} (${proposalToReview?.proposalId})`}
            proposalReviewModalOpen={!!proposalToReview}
            setProposalReviewModalOpen={() => {
              if (searchParams.get('proposalId')) {
                setProposalFilter({
                  ...proposalFilter,
                  referenceNumbers: undefined,
                });
              }

              setSearchParams((searchParams) => {
                searchParams.delete('reviewModal');
                searchParams.delete('proposalId');

                return searchParams;
              });

              refreshTableData();
            }}
          >
            <ProposalReviewContent
              proposalPk={proposalToReview?.primaryKey as number}
              tabNames={userOfficerProposalReviewTabs}
            />
          </ProposalReviewModal>
          <XpressProposalFilterBar
            calls={{ data: calls, isLoading: loadingCalls }}
            instruments={{ data: instruments, isLoading: loadingInstruments }}
            techniques={{
              data: techniques,
              isLoading: loadingTechniques,
            }}
            proposalStatuses={{
              data: xpressStatuses,
              isLoading: loadingProposalStatuses,
            }}
            handleFilterChange={handleFilterChange}
            filter={proposalFilter}
          />
          <MaterialTableCore<ProposalViewData>
            tableRef={tableRef}
            icons={tableIcons}
            title={'Xpress Proposals'}
            columns={columns}
            data={fetchRemoteProposalsData}
            options={{
              search: true,
              searchText: search || undefined,
              selection: true,
              headerSelectionProps: {
                inputProps: { 'aria-label': 'Select All Rows' },
              },
              debounceInterval: 600,
              columnsButton: true,
              selectionProps: (rowdata: ProposalViewData) => ({
                inputProps: {
                  'aria-label': `${rowdata.title}-select`,
                },
              }),
              pageSize: pageSize ? +pageSize : 5,
              initialPage: page ? +page : 0,
            }}
            actions={[
              {
                icon: ExportIcon,
                tooltip: 'Export proposals in Excel',
                onClick: (): void => {
                  downloadXLSXProposal(
                    searchParams
                      .getAll('selection')
                      .filter((item): item is string => !!item)
                      .map((item) => +item),
                    'title',
                    true
                  );
                },
                position: 'toolbarOnSelect',
              },
              {
                tooltip: 'Select all proposals',
                icon: DoneAllIcon,
                hidden: false,
                iconProps: {
                  hidden: allPrefetchedProposalsSelected,
                  defaultValue: totalCount,
                  className: allProposalSelectionLoading ? 'loading' : '',
                },
                onClick: async () => {
                  setAllProposalSelectionLoading(true);
                  if (allPrefetchedProposalsSelected) {
                    setSearchParams((searchParams) => {
                      searchParams.delete('selection');

                      return searchParams;
                    });
                    refreshTableData();
                  } else {
                    const selectedProposalsData =
                      await fetchProposalCoreBasicData();

                    if (!selectedProposalsData) {
                      return;
                    }

                    // NOTE: Adding the missing data in the tableData state variable because some proposal group actions use additional data than primaryKey.
                    const newTableData = selectedProposalsData.proposals?.map(
                      (sp) => {
                        const foundProposalData = tableData.find(
                          (td) => td.primaryKey === sp.primaryKey
                        );

                        if (foundProposalData) {
                          return foundProposalData;
                        } else {
                          return sp as ProposalViewData;
                        }
                      }
                    );

                    if (newTableData) {
                      setTableData(newTableData);
                    }

                    setSearchParams((searchParams) => {
                      searchParams.delete('selection');
                      selectedProposalsData.proposals?.forEach((proposal) => {
                        searchParams.append(
                          'selection',
                          proposal.primaryKey.toString()
                        );
                      });

                      return searchParams;
                    });
                    refreshTableData();
                  }

                  setAllProposalSelectionLoading(false);
                },
                position: 'toolbar',
              },
            ]}
            onSelectionChange={(selectedItems) => {
              setSearchParams((searchParam) => {
                searchParam.delete('selection');
                selectedItems.map((selectedItem) =>
                  searchParam.append(
                    'selection',
                    selectedItem.primaryKey.toString()
                  )
                );

                return searchParam;
              });
            }}
            onOrderCollectionChange={handleSortOrderChange}
            onSearchChange={handleSearchChange}
            onPageChange={(page, pageSize) => {
              searchParams.set('page', page.toString());
              searchParams.set('pageSize', pageSize.toString());
            }}
            detailPanel={[
              {
                tooltip: 'Show comment',
                render: XpressTablePanelDetails,
              },
            ]}
            localization={{
              toolbar: {
                nRowsSelected: `${selection.length} row(s) selected`,
              },
            }}
          />
        </StyledPaper>
      </StyledContainer>
    </>
  );
};

export default withConfirm(XpressProposalTable);
