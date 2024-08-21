import MaterialTable, { OrderByCollection } from '@material-table/core';
import React, { useEffect, useState } from 'react';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

import { DefaultQueryParams } from 'components/common/SuperMaterialTable';
import { ProposalsFilter } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { useTechniquesData } from 'hooks/technique/useTechniquesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import { tableIcons } from 'utils/materialIcons';

import { ProposalViewData, useProposalsCoreData } from './useProposalsCoreData';
import XpressProposalFilterBar from './XpressProposalFilterBar';

export interface ProposalData {
  proposalId: string;
  title: string;
  submittedDate: Date;
}

const XpressProposalTable = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedProposals, setSelectedProposals] = useState<ProposalData[]>(
    []
  );
  const { techniques, loadingTechniques } = useTechniquesData();
  const { instruments, loadingInstruments } = useInstrumentsData();
  const { calls, loadingCalls } = useCallsData();
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const PREFETCH_SIZE = 200;
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    ...DefaultQueryParams,
    call: NumberParam,
    instrument: NumberParam,
    technique: NumberParam,
    proposalId: StringParam,
    to: StringParam,
    from: StringParam,
  });

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
    searchText: urlQueryParams.search ?? undefined,
  });

  const [proposalFilter, setProposalFilter] = useState<ProposalsFilter>({
    callId: urlQueryParams.call,
    instrumentFilter: {
      instrumentId: urlQueryParams.instrument
        ? +urlQueryParams.instrument
        : null,
      showAllProposals: !urlQueryParams.instrument,
      showMultiInstrumentProposals: false,
    },
    techniqueFilter: {
      techniqueId: urlQueryParams.technique ? +urlQueryParams.technique : null,
      showAllProposals: !urlQueryParams.technique,
      showMultiTechniqueProposals: false,
    },
    dateFilter: {
      to: urlQueryParams.to ? urlQueryParams.to : null,
      from: urlQueryParams.from ? urlQueryParams.from : null,
    },
    referenceNumbers: urlQueryParams.proposalId
      ? [urlQueryParams.proposalId]
      : undefined,
  });

  const columns = [
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
      title: 'Date submitted',
      field: 'submittedDate',
      ...{ width: 'auto' },
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { loading, proposalsData, totalCount, setProposalsData } =
    useProposalsCoreData({
      proposalStatusId: proposalFilter.proposalStatusId,
      techniqueFilter: proposalFilter.techniqueFilter,
      instrumentFilter: proposalFilter.instrumentFilter,
      callId: proposalFilter.callId,
      referenceNumbers: proposalFilter.referenceNumbers,
      dateFilter: proposalFilter.dateFilter,
    });

  const [tableData, setTableData] = useState<ProposalViewData[]>([]);
  const [preselectedProposalsData, setPreselectedProposalsData] = useState<
    ProposalViewData[]
  >([]);

  useEffect(() => {
    setPreselectedProposalsData(proposalsData);
  }, [proposalsData]);

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

  useEffect(() => {
    setPreselectedProposalsData(proposalsData);
  }, [proposalsData]);

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
    setUrlQueryParams({ search: searchText ? searchText : undefined });
  };

  const proposalDataWithIdAndRowActions = tableData.map((proposal) => {
    return {
      proposalId: proposal.proposalId,
      title: proposal.title,
      submittedDate: proposal.submittedDate,
    };
  });

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
      setSelectedProposals([]);
    }
  }, [proposalsData, urlQueryParams.selection]);

  const handleSelectionChange = (rows: ProposalData[]) => {
    setUrlQueryParams((params) => ({
      ...params,
      selection:
        rows.length > 0
          ? rows.map((row) => row.proposalId.toString())
          : undefined,
    }));
  };

  const handleSortOrderChange = (orderByCollection: OrderByCollection[]) => {
    const [orderBy] = orderByCollection;
    setUrlQueryParams((params) => ({
      ...params,
      sortField: orderBy?.orderByField,
      sortDirection: orderBy?.orderDirection,
    }));
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
            setProposalFilter={setProposalFilter}
            filter={proposalFilter}
          />
          <MaterialTable<ProposalData>
            icons={tableIcons}
            title={'Xpress Proposals'}
            columns={columns}
            data={proposalDataWithIdAndRowActions}
            totalCount={20}
            isLoading={loading}
            options={{
              search: true,
              searchText: urlQueryParams.search || undefined,
              selection: true,
              headerSelectionProps: {
                inputProps: { 'aria-label': 'Select All Rows' },
              },
              debounceInterval: 600,
              columnsButton: true,
              pageSize: 20,
            }}
            onSelectionChange={handleSelectionChange}
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
                nRowsSelected: `${urlQueryParams.selection.length} row(s) selected`,
              },
            }}
          />
        </StyledPaper>
      </StyledContainer>
    </>
  );
};

export default XpressProposalTable;
