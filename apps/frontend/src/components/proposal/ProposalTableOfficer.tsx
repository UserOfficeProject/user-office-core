import MaterialTableCore, {
  Action,
  Column,
  MTableToolbar,
  Query,
  QueryResult,
} from '@material-table/core';
import { Visibility } from '@mui/icons-material';
import Delete from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import Email from '@mui/icons-material/Email';
import FileCopy from '@mui/icons-material/FileCopy';
import GetAppIcon from '@mui/icons-material/GetApp';
import GridOnIcon from '@mui/icons-material/GridOn';
import GroupWork from '@mui/icons-material/GroupWork';
import { IconButton, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import {
  ResourceId,
  getTranslation,
} from '@user-office-software/duo-localisation';
import i18n from 'i18n';
import { TFunction } from 'i18next';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import isEqual from 'react-fast-compare';
import { useTranslation } from 'react-i18next';

import CopyToClipboard from 'components/common/CopyToClipboard';
import MaterialTable from 'components/common/DenseMaterialTable';
import ListStatusIcon from 'components/common/icons/ListStatusIcon';
import ScienceIcon from 'components/common/icons/ScienceIcon';
import UOLoader from 'components/common/UOLoader';
import AssignProposalsToFaps from 'components/fap/Proposals/AssignProposalsToFaps';
import AssignProposalsToInstruments from 'components/instrument/AssignProposalsToInstruments';
import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import { FeatureContext } from 'context/FeatureContextProvider';
import {
  Call,
  ProposalsFilter,
  ProposalStatus,
  InstrumentMinimalFragment,
  FeatureId,
  FapInstrumentInput,
  FapInstrument,
  ProposalViewInstrument,
} from 'generated/sdk';
import { useLocalStorage } from 'hooks/common/useLocalStorage';
import { useTypeSafeSearchParams } from 'hooks/common/useTypeSafeSearchParams';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { useDownloadProposalAttachment } from 'hooks/proposal/useDownloadProposalAttachment';
import { useDownloadXLSXProposal } from 'hooks/proposal/useDownloadXLSXProposal';
import { ProposalViewData } from 'hooks/proposal/useProposalsCoreData';
import {
  addColumns,
  fromArrayToCommaSeparated,
  getUniqueArray,
  removeColumns,
  setSortDirectionOnSortField,
} from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import CallSelectModalOnProposalsClone from './CallSelectModalOnProposalClone';
import ChangeProposalStatus from './ChangeProposalStatus';
import ProposalAttachmentDownload from './ProposalAttachmentDownload';
import TableActionsDropdownMenu, {
  DownloadMenuOption,
  PdfDownloadMenuOption,
} from './TableActionsDropdownMenu';

type ProposalTableOfficerProps = {
  proposalFilter: ProposalsFilter;
  setProposalFilter: (filter: ProposalsFilter) => void;
  confirm: WithConfirmType;
};

export type ProposalSelectionType = {
  title: string;
  proposalId: string;
  primaryKey: number;
  callId: number;
  instruments: ProposalViewInstrument[] | null;
  fapInstruments: FapInstrument[] | null;
  statusId: number;
};

let columns: Column<ProposalViewData>[] = [
  {
    title: 'Proposal ID',
    field: 'proposalId',
    render: (rawData) => (
      <CopyToClipboard
        text={rawData.proposalId}
        successMessage={`'${rawData.proposalId}' copied to clipboard`}
        position="right"
      >
        {rawData.proposalId || ''}
      </CopyToClipboard>
    ),
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
    emptyValue: '-',
    render: (proposalView) => {
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
  },
  {
    title: 'PI Email',
    field: 'principalInvestigator.email',
    sorting: false,
    emptyValue: '-',
  },
  {
    title: 'Submitted',
    field: 'submitted',
    lookup: { true: 'Yes', false: 'No' },
  },
  {
    title: 'Status',
    field: 'statusName',
  },
  {
    title: 'Notified',
    field: 'notified',
    lookup: { true: 'Yes', false: 'No' },
  },
  {
    title: 'Call',
    field: 'callShortCode',
  },
];

const technicalReviewColumns = [
  {
    title: 'Technical status',
    field: 'technicalReviews.status',
    render: (rowData: ProposalViewData) =>
      fromArrayToCommaSeparated(
        rowData.technicalReviews?.map(
          (technicalReview) => technicalReview.status
        )
      ),
  },
  {
    title: 'Assigned technical reviewer',
    field: 'technicalReviewAssigneesFullName',
    render: (rowData: ProposalViewData) =>
      fromArrayToCommaSeparated(
        rowData.technicalReviews?.map((technicalReview) =>
          getFullUserName(technicalReview.technicalReviewAssignee)
        )
      ),
  },
  {
    title: 'Technical time allocation',
    field: 'technicalReviews.timeAllocation',
    render: (rowData: ProposalViewData) =>
      `${fromArrayToCommaSeparated(
        rowData.technicalReviews?.map(
          (technicalReview) => technicalReview.timeAllocation
        )
      )} (${rowData.allocationTimeUnit}s)`,
    hidden: true,
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

const fapReviewColumns = (t: TFunction<'translation', undefined>) => [
  { title: 'Final status', field: 'finalStatus', emptyValue: '-' },
  {
    title: 'Final time allocation',
    field: 'instruments.managementTimeAllocation',
    render: (rowData: ProposalViewData) =>
      `${fromArrayToCommaSeparated(
        rowData.instruments?.map((i) => i.managementTimeAllocation)
      )} (${rowData.allocationTimeUnit}s)`,
    hidden: true,
  },
  {
    title: t('FAP'),
    field: 'faps.code',
    render: (rowData: ProposalViewData) =>
      fromArrayToCommaSeparated(rowData.faps?.map((fap) => fap.code)),
  },
];
const SELECT_ALL_ACTION_TOOLTIP = 'select-all-prefetched-proposals';
const DEFAULT_PAGE_SIZE = 10;

/**
 * NOTE: This toolbar "select all" option works only with all prefetched proposals. Currently that value is set to "PREFETCH_SIZE=200"
 * For example if we change the PREFETCH_SIZE to 100, that would mean that it can select up to 100 prefetched proposals at once.
 * For now this works but if we want to support option where we really select all proposals in the database this needs to be refactored a bit.
 */
const ToolbarWithSelectAllPrefetched = (props: {
  actions: Action<ProposalViewData>[];
  selectedCount: number;
  dataManager: { data: ProposalViewData[] };
}) => {
  const selectAllAction = props.actions.find(
    (action) => action.hidden && action.tooltip === SELECT_ALL_ACTION_TOOLTIP
  );
  const tableHasData = !!props.dataManager.data.length;
  const allItemsSelectedOnThePage =
    props.selectedCount === props.dataManager.data.length;
  const isLoading = selectAllAction?.iconProps?.className?.includes('loading');

  return (
    <div data-cy="select-all-toolbar">
      <MTableToolbar {...props} />
      {tableHasData && !!selectAllAction && allItemsSelectedOnThePage && (
        <Box
          textAlign="center"
          padding={1}
          bgcolor={(theme) => theme.palette.background.default}
          data-cy="select-all-proposals"
        >
          {selectAllAction.iconProps?.hidden ? (
            <>
              All proposals are selected.
              <Button
                variant="text"
                onClick={() =>
                  selectAllAction.onClick(null, props.dataManager.data)
                }
                data-cy="clear-all-selection"
                disabled={isLoading}
              >
                Clear selection
              </Button>
            </>
          ) : (
            <>
              All {props.selectedCount} proposals on this page are selected.
              <Button
                variant="text"
                onClick={() =>
                  selectAllAction.onClick(null, props.dataManager.data)
                }
                data-cy="select-all-prefetched-proposals"
                disabled={isLoading}
              >
                Select all {selectAllAction.iconProps?.defaultValue} proposals
              </Button>
            </>
          )}
          {isLoading && <UOLoader size={20} sx={{ verticalAlign: 'middle' }} />}
        </Box>
      )}
    </div>
  );
};

/**
 * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
 * and selection flag is true they are not working properly.
 */
const RowActionButtons = (rowData: ProposalViewData) => {
  const initialParams = useMemo(
    () => ({
      reviewModal: null,
    }),
    []
  );

  const [, setTypedParams] = useTypeSafeSearchParams<{
    reviewModal: string | null;
  }>(initialParams);

  return (
    <Tooltip title="View proposal">
      <IconButton
        data-cy="view-proposal"
        onClick={() => {
          setTypedParams((prev) => ({
            ...prev,
            reviewModal: rowData.primaryKey.toString(),
          }));
        }}
      >
        <Visibility />
      </IconButton>
    </Tooltip>
  );
};

const ProposalTableOfficer = ({
  proposalFilter,
  setProposalFilter,
  confirm,
}: ProposalTableOfficerProps) => {
  const tableRef = React.useRef<MaterialTableCore<ProposalViewData>>();
  const [openAssignment, setOpenAssignment] = useState(false);
  const [openInstrumentAssignment, setOpenInstrumentAssignment] =
    useState(false);
  const [openChangeProposalStatus, setOpenChangeProposalStatus] =
    useState(false);
  const [tableData, setTableData] = useState<ProposalViewData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [openCallSelection, setOpenCallSelection] = useState(false);
  const [actionsMenuAnchorElement, setActionsMenuAnchorElement] =
    useState<null | HTMLElement>(null);
  const [openDownloadAttachment, setOpenDownloadAttachment] = useState(false);
  const [allProposalSelectionLoading, setAllProposalSelectionLoading] =
    useState(false);
  const downloadPDFProposal = useDownloadPDFProposal();
  const downloadProposalAttachment = useDownloadProposalAttachment();
  const downloadXLSXProposal = useDownloadXLSXProposal();
  const { api } = useDataApiWithFeedback();
  const { t } = useTranslation();
  const [localStorageValue, setLocalStorageValue] = useLocalStorage<
    Column<ProposalViewData>[] | null
  >('proposalColumnsOfficer', null);
  const featureContext = useContext(FeatureContext);

  const initialParams = useMemo(
    () => ({
      selection: [],
      sortField: null,
      sortDirection: null,
      page: '0',
      pageSize: DEFAULT_PAGE_SIZE.toString(),
      search: '',
      reviewModal: null,
      proposalId: null,
    }),
    []
  );

  const [typedParams, setTypedParams] = useTypeSafeSearchParams<{
    selection: string[];
    sortField: string | null;
    sortDirection: string | null;
    page: string;
    pageSize: string;
    search: string;
    reviewModal: string | null;
    proposalId: string | null;
  }>(initialParams);

  const handleDownloadActionClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setActionsMenuAnchorElement(event.currentTarget);
  };
  const refreshTableData = () => {
    tableRef.current?.onQueryChange({});
  };

  const GetAppIconComponent = (): JSX.Element => (
    <GetAppIcon data-cy="download-proposals" />
  );
  const DeleteIcon = (): JSX.Element => <Delete />;
  const GroupWorkIcon = (): JSX.Element => <GroupWork />;
  const EmailIcon = (): JSX.Element => <Email />;
  const ScienceIconComponent = (): JSX.Element => (
    <ScienceIcon data-cy="assign-remove-instrument" />
  );
  const ChangeProposalStatusIcon = (): JSX.Element => (
    <ListStatusIcon data-cy="change-proposal-status" />
  );
  const ExportIcon = (): JSX.Element => <GridOnIcon />;

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      refreshTableData();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(proposalFilter)]);

  const isTechnicalReviewEnabled = featureContext.featuresMap.get(
    FeatureId.TECHNICAL_REVIEW
  )?.isEnabled;
  const isInstrumentManagementEnabled = featureContext.featuresMap.get(
    FeatureId.INSTRUMENT_MANAGEMENT
  )?.isEnabled;
  const isFapEnabled = featureContext.featuresMap.get(
    FeatureId.FAP_REVIEW
  )?.isEnabled;

  if (!columns.find((column) => column.field === 'rowActionButtons')) {
    columns = [
      {
        title: 'Actions',
        cellStyle: { padding: 0 },
        sorting: false,
        removable: false,
        field: 'rowActionButtons',
        render: RowActionButtons,
      },
      ...columns,
    ];
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

  if (isFapEnabled) {
    addColumns(columns, fapReviewColumns(t));
  } else {
    removeColumns(columns, fapReviewColumns(t));
  }

  columns = columns.map((v: Column<ProposalViewData>) => {
    v.customSort = () => 0; // Disables client side sorting

    return v;
  });

  // NOTE: We are remapping only the hidden field because functions like `render` can not be stringified.
  if (localStorageValue) {
    columns = columns.map((column) => ({
      ...column,
      hidden: localStorageValue?.find(
        (localStorageValueItem) => localStorageValueItem.title === column.title
      )?.hidden,
    }));
  }

  const getSelectedProposalPks = () =>
    typedParams.selection.map((proposalPk) => +proposalPk);

  const getSelectedProposalsData = () =>
    tableData.filter((item) =>
      typedParams.selection.includes(item.primaryKey.toString())
    );

  const handleClose = (selectedOption: string) => {
    const firstSelectedProposalTitle = getSelectedProposalsData()[0].title;
    if (selectedOption === PdfDownloadMenuOption.PDF) {
      downloadPDFProposal(getSelectedProposalPks(), firstSelectedProposalTitle);
    } else if (selectedOption === PdfDownloadMenuOption.ZIP) {
      downloadPDFProposal(
        getSelectedProposalPks(),
        firstSelectedProposalTitle,
        'zip'
      );
    } else if (selectedOption === DownloadMenuOption.ATTACHMENT) {
      setOpenDownloadAttachment(true);
    }
    setActionsMenuAnchorElement(null);
  };

  // TODO: Maybe it will be good to make notifyProposal and deleteProposal bulk functions where we can sent array of proposal ids.
  const emailProposals = (): void => {
    getSelectedProposalPks().forEach(async (proposalPk) => {
      await api({
        toastSuccessMessage: 'Notification sent successfully',
      }).notifyProposal({
        proposalPk,
      });

      refreshTableData();
    });
  };

  const deleteProposals = (): void => {
    getSelectedProposalPks().forEach(async (proposalPk) => {
      await api().deleteProposal({ proposalPk });

      refreshTableData();
    });
  };

  const assignProposalsToFaps = async (
    fapInstsruments: FapInstrumentInput[]
  ): Promise<void> => {
    const shouldRemoveAssignments = fapInstsruments.every(
      (fapInstrument) => !fapInstrument.fapId
    );

    if (!shouldRemoveAssignments) {
      if (!fapInstsruments.length) {
        return;
      }

      await api({
        toastSuccessMessage: `Proposal/s assigned to the selected ${t('Fap')} successfully!`,
      }).assignProposalsToFaps({
        proposalPks: getSelectedProposalPks(),
        fapInstruments: fapInstsruments,
      });
    } else {
      const fapIdsFromSelectedProposals =
        getSelectedProposalsData()
          .map(
            (selectedProposal) =>
              selectedProposal.fapInstruments
                ?.filter((fapInstrument) => !!fapInstrument.fapId)
                .map((fapInstrument) => fapInstrument.fapId) || []
          )
          .flat() || [];

      await api({
        toastSuccessMessage: 'Proposal/s removed from the Fap successfully!',
      }).removeProposalsFromFaps({
        proposalPks: getSelectedProposalPks(),
        fapIds: getUniqueArray(fapIdsFromSelectedProposals),
      });
    }
    refreshTableData();
  };

  const assignProposalsToInstruments = async (
    instruments: InstrumentMinimalFragment[] | null
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

  const cloneProposalsToCall = async (call: Call) => {
    const proposalPks = getSelectedProposalPks();
    if (!call?.id || !proposalPks.length) {
      return;
    }

    await api({
      toastSuccessMessage: 'Proposal/s cloned successfully',
    }).cloneProposals({
      callId: call.id,
      proposalsToClonePk: proposalPks,
    });

    refreshTableData();
  };

  const changeStatusOnProposals = async (status: ProposalStatus) => {
    const proposalPks = getSelectedProposalPks();
    if (status?.id && proposalPks.length) {
      const shouldAddPluralLetter = proposalPks.length > 1 ? 's' : '';
      await api({
        toastSuccessMessage: `Proposal${shouldAddPluralLetter} status changed successfully!`,
      }).changeProposalsStatus({
        proposalPks: proposalPks,
        statusId: status.id,
      });
      refreshTableData();
    }
  };

  columns = setSortDirectionOnSortField(
    columns,
    typedParams.sortField,
    typedParams.sortDirection
  );

  const { reviewModal, proposalId } = typedParams;

  const proposalToReview = tableData.find(
    (proposal) =>
      (reviewModal != null && proposal.primaryKey === +reviewModal) ||
      (proposalId != null && proposal.proposalId === proposalId)
  );

  const userOfficerProposalReviewTabs = [
    PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
    ...(isTechnicalReviewEnabled
      ? [PROPOSAL_MODAL_TAB_NAMES.TECHNICAL_REVIEW]
      : []),
    ...(isFapEnabled ? [PROPOSAL_MODAL_TAB_NAMES.REVIEWS] : []),
    PROPOSAL_MODAL_TAB_NAMES.ADMIN,
    PROPOSAL_MODAL_TAB_NAMES.LOGS,
  ];

  const fetchRemoteProposalsData = (tableQuery: Query<ProposalViewData>) =>
    new Promise<QueryResult<ProposalViewData>>(async (resolve, reject) => {
      try {
        const [orderBy] = tableQuery.orderByCollection;
        const {
          callId,
          instrumentFilter,
          proposalStatusId,
          questionaryIds,
          text,
          questionFilter,
          referenceNumbers,
        } = proposalFilter;

        const { proposalsView } = await api().getProposalsCore({
          filter: {
            callId: callId,
            instrumentFilter: instrumentFilter,
            proposalStatusId: proposalStatusId,
            questionaryIds: questionaryIds,
            referenceNumbers: referenceNumbers,
            questionFilter: questionFilter && {
              ...questionFilter,
              value:
                JSON.stringify({ value: questionFilter?.value }) ?? undefined,
            }, // We wrap the value in JSON formatted string, because GraphQL can not handle UnionType input
            text: text,
          },
          sortField: orderBy?.orderByField,
          sortDirection: orderBy?.orderDirection,
          first: tableQuery.pageSize,
          offset: tableQuery.page * tableQuery.pageSize,
          searchText: tableQuery.search,
        });

        const tableData =
          proposalsView?.proposalViews.map((proposal) => {
            const selection = new Set(typedParams.selection);

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

            if (typedParams.selection.length > 0) {
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
        setTotalCount(proposalsView?.totalCount || 0);

        resolve({
          data: tableData,
          page: tableQuery.page,
          totalCount: proposalsView?.totalCount || 0,
        });
      } catch (error) {
        reject(error);
      }
    });

  const fetchProposalCoreBasicData = async () => {
    const {
      callId,
      instrumentFilter,
      proposalStatusId,
      questionaryIds,
      text,
      questionFilter,
      referenceNumbers,
    } = proposalFilter;

    const { proposalsView } = await api().getProposalCoreBasic({
      filter: {
        callId: callId,
        instrumentFilter: instrumentFilter,
        proposalStatusId: proposalStatusId,
        questionaryIds: questionaryIds,
        referenceNumbers: referenceNumbers,
        questionFilter: questionFilter && {
          ...questionFilter,
          value: JSON.stringify({ value: questionFilter?.value }) ?? undefined,
        }, // We wrap the value in JSON formatted string, because GraphQL can not handle UnionType input
        text: text,
      },
      searchText: typedParams.search,
    });

    return proposalsView?.proposalViews;
  };

  const selectedProposalsData = getSelectedProposalsData();

  // const pageSize = searchParams.get('pageSize');
  // const page = searchParams.get('page');
  // const search = searchParams.get('search');

  const { pageSize, page, search } = typedParams;
  const shouldShowSelectAllAction =
    totalCount > (pageSize ? +pageSize : DEFAULT_PAGE_SIZE)
      ? SELECT_ALL_ACTION_TOOLTIP
      : undefined;
  const allPrefetchedProposalsSelected =
    totalCount === typedParams.selection.length;

  const proposalFapInstruments = selectedProposalsData
    .filter((item) => !!item.instruments)
    .map((selectedProposal) => selectedProposal.fapInstruments)
    .flat();

  const proposalsInstruments = selectedProposalsData
    .filter((item) => !!item.instruments)
    .map((selectedProposal) => selectedProposal.instruments);

  return (
    <>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openAssignment}
        onClose={(): void => setOpenAssignment(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <AssignProposalsToFaps
            assignProposalsToFaps={assignProposalsToFaps}
            close={(): void => setOpenAssignment(false)}
            proposalFapInstruments={proposalFapInstruments}
            proposalInstruments={proposalsInstruments}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openInstrumentAssignment}
        onClose={(): void => setOpenInstrumentAssignment(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <AssignProposalsToInstruments
            assignProposalsToInstruments={assignProposalsToInstruments}
            close={(): void => setOpenInstrumentAssignment(false)}
            callIds={selectedProposalsData.map(
              (selectedProposal) => selectedProposal.callId
            )}
            instrumentIds={selectedProposalsData
              .map((selectedProposal) =>
                (selectedProposal.instruments || []).map(
                  (instrument) => instrument.id
                )
              )
              .flat()}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openChangeProposalStatus}
        maxWidth="xs"
        onClose={(): void => setOpenChangeProposalStatus(false)}
        fullWidth
      >
        <DialogContent>
          <ChangeProposalStatus
            changeStatusOnProposals={changeStatusOnProposals}
            close={(): void => setOpenChangeProposalStatus(false)}
            selectedProposalStatuses={selectedProposalsData.map(
              (selectedProposal) => selectedProposal.statusId
            )}
            allSelectedProposalsHaveInstrument={selectedProposalsData.every(
              (selectedProposal) => selectedProposal.instruments?.length
            )}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openCallSelection}
        onClose={(): void => setOpenCallSelection(false)}
      >
        <DialogContent>
          <CallSelectModalOnProposalsClone
            cloneProposalsToCall={cloneProposalsToCall}
            close={(): void => setOpenCallSelection(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openDownloadAttachment}
        onClose={(): void => setOpenDownloadAttachment(false)}
      >
        <DialogContent>
          <ProposalAttachmentDownload
            close={(): void => setOpenDownloadAttachment(false)}
            referenceNumbers={selectedProposalsData.map(
              (selectedProposal) => selectedProposal.proposalId
            )}
            downloadProposalAttachment={(
              proposalIds: number[],
              questionIds: string
            ) =>
              downloadProposalAttachment(proposalIds, {
                questionIds,
              })
            }
          />
        </DialogContent>
      </Dialog>
      <TableActionsDropdownMenu
        event={actionsMenuAnchorElement}
        handleClose={handleClose}
      />
      <ProposalReviewModal
        title={`View proposal: ${proposalToReview?.title} (${proposalToReview?.proposalId})`}
        proposalReviewModalOpen={!!proposalToReview}
        setProposalReviewModalOpen={() => {
          if (typedParams.proposalId) {
            setProposalFilter({
              ...proposalFilter,
              referenceNumbers: undefined,
            });
          }

          setTypedParams((prev) => ({
            ...prev,
            reviewModal: null,
          }));
          refreshTableData();
        }}
      >
        <ProposalReviewContent
          proposalPk={proposalToReview?.primaryKey as number}
          tabNames={userOfficerProposalReviewTabs}
        />
      </ProposalReviewModal>
      <MaterialTable
        tableRef={tableRef}
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            Proposals
          </Typography>
        }
        columns={columns}
        data={fetchRemoteProposalsData}
        localization={{
          toolbar: {
            nRowsSelected: `${typedParams.selection.length} row(s) selected`,
          },
        }}
        components={{
          Toolbar: ToolbarWithSelectAllPrefetched,
        }}
        onPageChange={(page, pageSize) => {
          setTypedParams((searchParams) => ({
            ...searchParams,
            page: page.toString(),
            pageSize: pageSize.toString(),
          }));
        }}
        onSearchChange={(searchText) => {
          setTypedParams((searchParams) => ({
            ...searchParams,
            search: searchText ? searchText : '',
            page: searchText ? '0' : page || '',
          }));
        }}
        onSelectionChange={(selectedItems) => {
          if (selectedItems.length) {
            setTypedParams((prev) => ({
              ...prev,
              selection: selectedItems.map((selectedItem) =>
                selectedItem.primaryKey.toString()
              ),
            }));
          } else {
            setTypedParams((prev) => ({
              ...prev,
              selection: [],
            }));
          }
        }}
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
          pageSize: pageSize ? +pageSize : undefined,
          initialPage: search ? 0 : page ? +page : 0,
        }}
        actions={[
          {
            icon: FileCopy,
            tooltip: 'Clone proposals to call',
            onClick: () => {
              setOpenCallSelection(true);
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: GetAppIconComponent,
            tooltip: 'Download proposals',
            onClick: (event): void => {
              handleDownloadActionClick(event);
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: ExportIcon,
            tooltip: 'Export proposals in Excel',
            onClick: (): void => {
              downloadXLSXProposal(
                typedParams.selection.map((item) => +item),
                selectedProposalsData?.[0].title
              );
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: DeleteIcon,
            tooltip: 'Delete proposals',
            onClick: () => {
              confirm(
                () => {
                  deleteProposals();
                },
                {
                  title: 'Delete proposals',
                  description:
                    'This action will delete proposals and all data associated with them.',
                }
              )();
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: GroupWorkIcon,
            tooltip: 'Assign proposals to FAP',
            onClick: () => {
              setOpenAssignment(true);
            },
            position: 'toolbarOnSelect',
          },
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
          {
            icon: ChangeProposalStatusIcon,
            tooltip: 'Change proposal status',
            onClick: () => {
              setOpenChangeProposalStatus(true);
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: EmailIcon,
            tooltip: 'Notify users final result',
            onClick: () => {
              confirm(
                () => {
                  emailProposals();
                },
                {
                  title: 'Notify results',
                  description:
                    'This action will trigger emails to be sent to principal investigators.',
                }
              )();
            },
            position: 'toolbarOnSelect',
          },
          {
            tooltip: shouldShowSelectAllAction,
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
                setTypedParams((prev) => ({
                  ...prev,
                  selection: [],
                }));
                refreshTableData();
              } else {
                const selectedProposalsData =
                  await fetchProposalCoreBasicData();

                if (!selectedProposalsData) {
                  return;
                }

                // NOTE: Adding the missing data in the tableData state variable because some proposal group actions use additional data than primaryKey.
                const newTableData = selectedProposalsData?.map((sp) => {
                  const foundProposalData = tableData.find(
                    (td) => td.primaryKey === sp.primaryKey
                  );

                  if (foundProposalData) {
                    return foundProposalData;
                  } else {
                    return sp as ProposalViewData;
                  }
                });

                setTableData(newTableData);

                setTypedParams((prev) => ({
                  ...prev,
                  selection: selectedProposalsData.map((proposal) =>
                    proposal.primaryKey.toString()
                  ),
                }));
                refreshTableData();
              }

              setAllProposalSelectionLoading(false);
            },
            position: 'toolbarOnSelect',
          },
        ]}
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
        onOrderCollectionChange={(orderByCollection) => {
          const [orderBy] = orderByCollection;

          if (!orderBy) {
            setTypedParams((prev) => ({
              ...prev,
              sortField: null,
              sortDirection: null,
            }));
          } else {
            setTypedParams((prev) => ({
              ...prev,
              sortField: orderBy.orderByField,
              sortDirection: orderBy.orderDirection,
            }));
          }
        }}
      />
    </>
  );
};

export default React.memo(withConfirm(ProposalTableOfficer), isEqual);
