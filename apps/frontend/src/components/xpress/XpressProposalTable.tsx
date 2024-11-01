import MaterialTableCore, {
  Column,
  OrderByCollection,
  Query,
  QueryResult,
} from '@material-table/core';
import { FormControl, MenuItem, Select } from '@mui/material';
import {
  getTranslation,
  ResourceId,
} from '@user-office-software/duo-localisation';
import i18n from 'i18n';
import { t, TFunction } from 'i18next';
import React, { useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import { ProposalsFilter, SettingsId, UserRole } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { CallsDataQuantity, useCallsData } from 'hooks/call/useCallsData';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { ProposalViewData } from 'hooks/proposal/useProposalsCoreData';
import { useProposalStatusesData } from 'hooks/settings/useProposalStatusesData';
import { useTechniquesData } from 'hooks/technique/useTechniquesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import {
  addColumns,
  fromArrayToCommaSeparated,
  setSortDirectionOnSortField,
} from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { useXpressInstrumentsData } from './useXpressInstrumentsData';
import XpressProposalFilterBar from './XpressProposalFilterBar';

const XpressProposalTable = ({ confirm }: { confirm: WithConfirmType }) => {
  const tableRef = React.useRef<MaterialTableCore<ProposalViewData>>();
  const refreshTableData = () => {
    tableRef.current?.onQueryChange({});
  };
  const { techniques, loadingTechniques } = useTechniquesData();
  const { proposalStatuses, loadingProposalStatuses } =
    useProposalStatusesData();

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

  const { api } = useDataApiWithFeedback();
  const { currentRole } = useContext(UserContext);

  const isHistoricProposal = (date: Date): boolean => date.getFullYear() < 2024;

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
    StatusCode.EXPIRED,
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

  const [tableData, setTableData] = useState<ProposalViewData[]>([]);

  let columns: Column<ProposalViewData>[] = [
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
        return toFormattedDateTime(proposalView.submittedDate);
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
      title: t('instrument'),
      field: 'instruments.name',
      sorting: false,
      render: (rowData: ProposalViewData) => {
        if (loadingProposalStatuses) {
          return <UOLoader style={{ marginLeft: '50%', marginTop: '20px' }} />;
        }

        const techIds = rowData.techniques?.map((technique) => technique.id);
        const instrumentList = techniques
          .filter((technique) => techIds?.includes(technique.id))
          .flatMap((technique) => technique.instruments);
        const fieldValue = rowData.instruments?.map(
          (instrument) => instrument.id
        )[0];

        const selectedStatus = proposalStatuses.find(
          (ps) => ps.name === rowData.statusName
        )?.shortCode;

        const shouldBeUneditable =
          !isUserOfficer &&
          (selectedStatus !== StatusCode.UNDER_REVIEW ||
            isHistoricProposal(new Date(rowData.submittedDate)));

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
                value={fieldValue}
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
      title: 'Status',
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
        const isStatusDraft = fieldValue?.shortCode === StatusCode.DRAFT;
        const isStatusSubmitted =
          fieldValue?.shortCode === StatusCode.SUBMITTED_LOCKED;
        const isStatusUnsuccessful =
          fieldValue?.shortCode === StatusCode.UNSUCCESSFUL;
        const isStatusApproved = fieldValue?.shortCode === StatusCode.APPROVED;
        const isStatusFinished = fieldValue?.shortCode === StatusCode.FINISHED;
        const isStatusExpired = fieldValue?.shortCode === StatusCode.EXPIRED;

        const shouldDisableUnderReview =
          isStatusApproved || isStatusUnsuccessful;

        const shouldDisableApproved = isStatusSubmitted || isInstrumentAbsent;

        const shouldDisableUnsuccessful = isStatusSubmitted;

        const shouldDisableFinished = !isStatusApproved || isInstrumentAbsent;

        const shouldBeUneditable =
          !isUserOfficer &&
          (isStatusDraft ||
            isStatusFinished ||
            isStatusUnsuccessful ||
            isStatusExpired ||
            isHistoricProposal(new Date(rowData.submittedDate)));

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
          excludeProposalStatusIds,
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
              ...(currentRole === UserRole.INSTRUMENT_SCIENTIST ||
              currentRole === UserRole.INTERNAL_REVIEWER
                ? { excludeProposalStatusIds: excludeProposalStatusIds }
                : {}),
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
                  technicalReviews: proposal.technicalReviews?.map(
                    (technicalReview) => ({
                      ...technicalReview,
                      status: getTranslation(
                        technicalReview.status as ResourceId
                      ),
                    })
                  ),
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

  const { calls, loadingCalls } = useCallsData(
    undefined,
    CallsDataQuantity.EXTENDED
  );

  const { instruments, loadingInstruments } = useXpressInstrumentsData(
    tableData,
    techniques,
    calls
  );

  const handleSearchChange = (searchText: string) => {
    setSearchParams({
      search: searchText ? searchText : '',
      page: searchText ? '0' : page || '',
    });
  };

  return (
    <>
      <StyledContainer maxWidth={false}>
        <StyledPaper data-cy="xpress-proposals-table">
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
              setSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
              });
            }}
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
