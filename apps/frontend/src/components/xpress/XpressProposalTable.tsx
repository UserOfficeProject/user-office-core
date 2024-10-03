import MaterialTableCore, {
  Column,
  OrderByCollection,
} from '@material-table/core';
import { Dialog, DialogContent } from '@mui/material';
import i18n from 'i18n';
import { t, TFunction } from 'i18next';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import MaterialTable from 'components/common/DenseMaterialTable';
import ScienceIcon from 'components/common/icons/ScienceIcon';
import { InstrumentFragment, ProposalsFilter } from 'generated/sdk';
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
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import AssignProposalsToXpressInstruments from './AssignProposalsToXpressInstruments';
import InstrumentSelection from './InstrumentSelection';
import { ProposalViewData, useProposalsCoreData } from './useProposalsCoreData';
import { useXpressInstrumentsData } from './useXpressInstrumentsData';
import XpressProposalFilterBar from './XpressProposalFilterBar';

const XpressProposalTable = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedProposals, setSelectedProposals] = useState<
    ProposalViewData[]
  >([]);
  const { techniques, loadingTechniques } = useTechniquesData();
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

  const { loading, proposalsData, totalCount } = useProposalsCoreData(
    {
      proposalStatusId: proposalFilter.proposalStatusId,
      techniqueFilter: proposalFilter.techniqueFilter,
      instrumentFilter: proposalFilter.instrumentFilter,
      callId: proposalFilter.callId,
      referenceNumbers: proposalFilter.referenceNumbers,
      dateFilter: proposalFilter.dateFilter,
      text: queryParameters.searchText,
      excludeProposalStatusIds: proposalFilter.excludeProposalStatusIds,
    },
    queryParameters.query
  );

  const [tableData, setTableData] = useState<ProposalViewData[]>([]);
  const [preselectedProposalsData, setPreselectedProposalsData] = useState<
    ProposalViewData[]
  >([]);

  const { instruments, loadingInstruments } = useXpressInstrumentsData(
    proposalsData,
    techniques
  );

  const { calls, loadingCalls } = useCallsData();

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
  }, [
    rowsPerPage,
    preselectedProposalsData,
    queryParameters,
    totalCount,
    currentPage,
  ]);

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

  const ScienceIconComponent = (): JSX.Element => (
    <ScienceIcon data-cy="assign-remove-instrument" />
  );

  const [openInstrumentAssignment, setOpenInstrumentAssignment] =
    useState(false);

  const { api } = useDataApiWithFeedback();

  const getSelectedProposalPks = () =>
    searchParams
      .getAll('selection')
      .filter((proposalPk): proposalPk is string => proposalPk !== null)
      .map((proposalPk) => +proposalPk);

  const tableRef = React.useRef<MaterialTableCore<ProposalViewData>>();
  const refreshTableData = () => {
    tableRef.current?.onQueryChange({});
  };

  const assignProposalsToInstruments = async (
    instruments: InstrumentFragment[] | null
  ): Promise<void> => {
    if (instruments?.length) {
      await api({
        toastSuccessMessage: `Proposal/s assigned to the selected ${i18n.format(
          t('instrument'),
          'lowercase'
        )} successfully!`,
      }).assignProposalsToInstruments({
        proposalPks: getSelectedProposalPks(),
        instrumentIds: instruments.map((instrument) => instrument.id),
      });
    } else {
      await api({
        toastSuccessMessage: `Proposal/s removed from the ${i18n.format(
          t('instrument'),
          'lowercase'
        )} successfully!`,
      }).removeProposalsFromInstrument({
        proposalPks: getSelectedProposalPks(),
      });
    }

    refreshTableData();
  };

  const RowActionButtons = (rowData: ProposalViewData) => {
    return <InstrumentSelection techniqueInRow={rowData.techniques} />;
  };

  if (!columns.find((column) => column.field === 'rowActionButtons')) {
    columns = [
      {
        title: 'Action',
        cellStyle: { padding: 0 },
        sorting: false,
        removable: false,
        field: 'rowActionButtons',
        render: RowActionButtons,
      },
      ...columns,
    ];
  }

  return (
    <>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openInstrumentAssignment}
        onClose={(): void => setOpenInstrumentAssignment(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <AssignProposalsToXpressInstruments
            assignProposalsToInstruments={assignProposalsToInstruments}
            close={(): void => setOpenInstrumentAssignment(false)}
            proposals={selectedProposals}
            instrumentIds={selectedProposals
              .map((selectedProposal) =>
                (selectedProposal.instruments || []).map(
                  (instrument) => instrument.id
                )
              )
              .flat()}
            techniques={techniques}
          />
        </DialogContent>
      </Dialog>
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
            isLoading={loading}
            totalCount={totalCount}
            page={currentPage}
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
            actions={[
              {
                icon: ScienceIconComponent,
                tooltip: `Assign/Remove ${i18n.format(
                  t('instrument'),
                  'lowercase'
                )}`,
                onClick: () => {
                  setOpenInstrumentAssignment(true);
                },
                position: 'toolbarOnSelect',
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
