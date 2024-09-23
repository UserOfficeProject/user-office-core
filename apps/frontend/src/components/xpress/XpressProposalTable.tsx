import MaterialTable, { Column, OrderByCollection } from '@material-table/core';
import { t, TFunction } from 'i18next';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ProposalsFilter } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useProposalStatusesData } from 'hooks/settings/useProposalStatusesData';
import { useTechniquesData } from 'hooks/technique/useTechniquesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import {
  addColumns,
  fromArrayToCommaSeparated,
  setSortDirectionOnSortField,
} from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';

import { ProposalViewData, useProposalsCoreData } from './useProposalsCoreData';
import { useXpressInstrumentsData } from './useXpressInstrumentsData';
import XpressProposalFilterBar from './XpressProposalFilterBar';

const XpressProposalTable = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedProposals, setSelectedProposals] = useState<
    ProposalViewData[]
  >([]);
  const { techniques, loadingTechniques } = useTechniquesData();
  const { calls, loadingCalls } = useCallsData();
  const { proposalStatuses, loadingProposalStatuses } =
    useProposalStatusesData();
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const PREFETCH_SIZE = 200;

  const [searchParams, setSearchParams] = useSearchParams({});

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

  type QueryParameters = {
    query: {
      first?: number;
      offset?: number;
    };
    searchText?: string | undefined;
  };
  const [queryParameters, setQueryParameters] = useState<QueryParameters>({
    query: {
      first: PREFETCH_SIZE,
      offset: 0,
    },
    searchText: search ?? undefined,
  });

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
    excludeProposalStatusIds: [9],
  });

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
      render: (proposalView: ProposalViewData) => {
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
      customFilterAndSearch: () => true,
    },
    {
      title: 'PI Email',
      field: 'principalInvestigator.email',
      sorting: false,
      emptyValue: '-',
    },
    {
      title: 'Status',
      field: 'statusName',
    },
    {
      title: 'Date submitted',
      field: 'submittedDate',
      ...{ width: 'auto' },
    },
  ];

  const instrumentManagementColumns = (
    t: TFunction<'translation', undefined>
  ) => [
    {
      title: t('instrument'),
      field: 'instruments.name',
      render: (rowData: ProposalViewData) =>
        fromArrayToCommaSeparated(
          rowData.instruments?.map((instrument) => instrument.name)
        ),
      customFilterAndSearch: () => true,
    },
  ];

  const techniquesColumns = () => [
    {
      title: 'Technique',
      field: 'technique.name',
      render: (rowData: ProposalViewData) =>
        fromArrayToCommaSeparated(
          rowData.techniques?.map((technique) => technique.name)
        ),
      customFilterAndSearch: () => true,
    },
  ];

  addColumns(columns, instrumentManagementColumns(t));
  addColumns(columns, techniquesColumns());

  columns = setSortDirectionOnSortField(columns, sortField, sortDirection);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { loading, proposalsData, totalCount, setProposalsData } =
    useProposalsCoreData({
      proposalStatusId: proposalFilter.proposalStatusId,
      techniqueFilter: proposalFilter.techniqueFilter,
      instrumentFilter: proposalFilter.instrumentFilter,
      callId: proposalFilter.callId,
      referenceNumbers: proposalFilter.referenceNumbers,
      dateFilter: proposalFilter.dateFilter,
      text: queryParameters.searchText,
      excludeProposalStatusIds: proposalFilter.excludeProposalStatusIds,
    });

  const [tableData, setTableData] = useState<ProposalViewData[]>([]);
  const [preselectedProposalsData, setPreselectedProposalsData] = useState<
    ProposalViewData[]
  >([]);

  const { instruments, loadingInstruments } = useXpressInstrumentsData(
    loading ? [] : proposalsData
  );

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
  }, [currentPage, rowsPerPage, preselectedProposalsData]);

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
  }, [proposalsData, JSON.stringify(selection)]);

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

  useEffect(() => {
    setPreselectedProposalsData(proposalsData);
  }, [proposalsData, queryParameters]);

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
              data: proposalStatuses,
              isLoading: loadingProposalStatuses,
            }}
            setProposalFilter={setProposalFilter}
            filter={proposalFilter}
          />
          <MaterialTable<ProposalViewData>
            icons={tableIcons}
            title={'Xpress Proposals'}
            columns={columns}
            data={tableData}
            totalCount={20}
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
              pageSize: 20,
              selectionProps: (rowdata: ProposalViewData) => ({
                inputProps: {
                  'aria-label': `${rowdata.title}-select`,
                },
              }),
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
            onRowsPerPageChange={(rowsPerPage) => setRowsPerPage(rowsPerPage)}
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

export default XpressProposalTable;
