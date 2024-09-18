import MaterialTable, { OrderByCollection } from '@material-table/core';
import { t, TFunction } from 'i18next';
import React, { useEffect, useState } from 'react';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

import { DefaultQueryParams } from 'components/common/SuperMaterialTable';
import {
  ProposalsFilter,
  ProposalViewInstrument,
  ProposalViewTechnique,
  User,
} from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { useProposalStatusesData } from 'hooks/settings/useProposalStatusesData';
import { useTechniquesData } from 'hooks/technique/useTechniquesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import { addColumns, fromArrayToCommaSeparated } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';

import { ProposalViewData, useProposalsCoreData } from './useProposalsCoreData';
import XpressProposalFilterBar from './XpressProposalFilterBar';

export interface ProposalData {
  callId: number;
  proposalId: string;
  title: string;
  submittedDate: Date;
  instruments: ProposalViewInstrument[] | null;
  techniques: ProposalViewTechnique[] | null;
  principalInvestigator: User | null;
  status: string;
}

const XpressProposalTable = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedProposals, setSelectedProposals] = useState<ProposalData[]>(
    []
  );
  const { techniques, loadingTechniques } = useTechniquesData();
  const { instruments, loadingInstruments } = useInstrumentsData();
  const { calls, loadingCalls } = useCallsData();
  const { proposalStatuses, loadingProposalStatuses } =
    useProposalStatusesData();
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
    proposalStatus: NumberParam,
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
    proposalStatusId: urlQueryParams.proposalStatus,
    text: urlQueryParams.search,
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
      title: 'Status',
      field: 'status',
    },
    {
      title: 'Date submitted',
      field: 'submittedDate',
      ...{ width: 'auto' },
    },
  ];

  const piColumn = () => [
    {
      title: 'Principal Investigator',
      field: 'principalInvestigator',
      render: (proposalView: ProposalData) => {
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

  addColumns(columns, piColumn());
  addColumns(columns, instrumentManagementColumns(t));
  addColumns(columns, techniquesColumns());

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
    });

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
      callId: proposal.callId,
      proposalId: proposal.proposalId,
      title: proposal.title,
      submittedDate: proposal.submittedDate,
      instruments: proposal.instruments,
      techniques: proposal.techniques,
      principalInvestigator: proposal.principalInvestigator,
      status: proposal.status,
    };
  });

  useEffect(() => {
    if (urlQueryParams.selection.length > 0) {
      const selection = new Set(urlQueryParams.selection);
      const selected: ProposalViewData[] = [];
      setPreselectedProposalsData(
        proposalsData.map((proposal) => {
          if (selection.has(proposal.proposalId.toString())) {
            selected.push(proposal);
          }

          return {
            ...proposal,
            tableData: {
              checked: selection.has(proposal.proposalId.toString()),
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
            proposalStatuses={{
              data: proposalStatuses,
              isLoading: loadingProposalStatuses,
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
              selectionProps: (rowdata: ProposalData) => ({
                inputProps: {
                  'aria-label': `${rowdata.title}-select`,
                },
              }),
            }}
            onSelectionChange={(selectedItems) => {
              setUrlQueryParams({
                selection:
                  selectedItems.length > 0
                    ? selectedItems.map((selectedItem) =>
                        selectedItem.proposalId.toString()
                      )
                    : undefined,
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
