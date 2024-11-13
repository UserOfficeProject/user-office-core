import MaterialTableCore, {
  Column,
  OrderByCollection,
  Query,
  QueryResult,
} from '@material-table/core';
import { Visibility } from '@mui/icons-material';
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

import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import { UserContext } from 'context/UserContextProvider';
import { ProposalsFilter, UserRole } from 'generated/sdk';
import { CallsDataQuantity, useCallsData } from 'hooks/call/useCallsData';
import { useDownloadXLSXProposal } from 'hooks/proposal/useDownloadXLSXProposal';
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

import { useXpressInstrumentsData } from './useXpressInstrumentsData';
import XpressNotice from './XpressNotice';
import XpressProposalFilterBar from './XpressProposalFilterBar';

const XpressProposalTable = () => {
  const tableRef = React.useRef<MaterialTableCore<ProposalViewData>>();
  const refreshTableData = () => {
    tableRef.current?.onQueryChange({});
  };
  const { techniques, loadingTechniques } = useTechniquesData();
  const { proposalStatuses, loadingProposalStatuses } =
    useProposalStatusesData();

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

  const [tableData, setTableData] = useState<ProposalViewData[]>([]);

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

  let columns: Column<ProposalViewData>[] = [
    {
      title: 'Actions',
      cellStyle: { padding: 0, minWidth: 120 },
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
      title: 'Status',
      field: 'statusName',
    },
    {
      title: 'Date submitted',
      field: 'submittedDate',
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

  const instrumentManagementColumns = (
    t: TFunction<'translation', undefined>
  ) => [
    {
      title: t('instrument'),
      field: 'instruments.name',
      sorting: false,
      render: (rowData: ProposalViewData) => {
        const techIds = rowData.techniques?.map((technique) => technique.id);
        const instrumentList = techniques
          .filter((technique) => techIds?.includes(technique.id))
          .flatMap((technique) => technique.instruments);
        const fieldValue = rowData.instruments?.map(
          (instrument) => instrument.id
        )[0];

        return (
          <>
            <FormControl fullWidth>
              <Select
                id="instrument-selection"
                aria-labelledby="instrument-select-label"
                onChange={(e) => {
                  if (e.target.value) {
                    assignProposalsToInstruments(
                      +e.target.value,
                      rowData.primaryKey
                    );
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
          currentRole === UserRole.INTERNAL_REVIEWER
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
    PROPOSAL_MODAL_TAB_NAMES.LOGS,
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
              data: proposalStatuses,
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

export default XpressProposalTable;
