import MaterialTable, {
  MaterialTableProps,
  MTableBodyRow,
} from '@material-table/core';
import DragHandle from '@mui/icons-material/DragHandle';
import RefreshIcon from '@mui/icons-material/Refresh';
import Visibility from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import React, {
  useContext,
  DragEvent,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';

import { UserContext } from 'context/UserContextProvider';
import {
  FapProposal,
  InstrumentWithAvailabilityTime,
  UserRole,
  FapMeetingDecision,
  Call,
  Proposal,
  TechnicalReview,
  ProposalPkWithRankOrder,
} from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useTypeSafeSearchParams } from 'hooks/common/useTypeSafeSearchParams';
import { useFapProposalsByInstrument } from 'hooks/fap/useFapProposalsByInstrument';
import { tableIcons } from 'utils/materialIcons';
import {
  getGradesFromReviews,
  average,
  standardDeviation,
} from 'utils/mathFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';

import FapMeetingProposalViewModal from './ProposalViewModal/FapMeetingProposalViewModal';

type FapProposalWithAverageScoreAndAvailabilityZone = FapProposal & {
  proposalAverageScore: number | string;
  proposalDeviation: number | string;
  isInAvailabilityZone: boolean;
  tableData?: { index: number; id: number };
};

// NOTE: Some custom styles for row expand table.
const rootStyles = {
  '& table': {
    backgroundColor: '#ddd',
  },
  '& .lastRowInAvailabilityZone:not(.draggingRow)': {
    position: 'relative',
    borderBottom: '23px solid white',

    '&::after': {
      content: 'attr(unallocated-time-information)',
      position: 'absolute',
      bottom: -34,
      left: 0,
      zIndex: 2,
      background: 'rgba(0,0,0, .2)',
      width: '100%',
      padding: '2px 12px',
      fontSize: 'small',
    },
  },
  '& tr': {
    transition: 'all 200ms ease-out',
    backgroundColor: '#fafafa',
  },
  '& tr td': {
    whiteSpace: 'nowrap',
  },
  '& tr:last-child td': {
    border: 'none',
  },
  '& .MuiPaper-root': {
    backgroundColor: '#fafafa',
  },
  '& .draggingRow': {
    visibility: 'hidden',
  },
  '& .shiftUp': {
    transform: 'translateY(-50px)',
  },
  '& .shiftDown': {
    transform: 'translateY(50px)',
  },
};

type FapInstrumentProposalsTableProps = {
  fapInstrument: InstrumentWithAvailabilityTime;
  fapId: number;
  selectedCall?: Call;
};

const FapInstrumentProposalsTable = ({
  fapInstrument,
  fapId,
  selectedCall,
}: FapInstrumentProposalsTableProps) => {
  const initialParams = useMemo(
    () => ({
      fapMeetingModal: null,
    }),
    []
  );

  const [typedParams, setTypedParams] = useTypeSafeSearchParams<{
    fapMeetingModal: string | null;
  }>(initialParams);

  const { fapMeetingModal } = typedParams;

  const {
    instrumentProposalsData,
    loadingInstrumentProposals,
    setInstrumentProposalsData,
    refreshInstrumentProposalsData,
  } = useFapProposalsByInstrument(fapInstrument.id, fapId, selectedCall?.id);

  const theme = useTheme();
  const isFapReviewer = useCheckAccess([UserRole.FAP_REVIEWER]);
  const { user } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const [openProposal, setOpenProposal] = useState<Proposal | null>(null);
  const { t } = useTranslation();

  const getInstrumentTechnicalReview = (
    technicalReviews: TechnicalReview[] | null
  ) =>
    technicalReviews?.find(
      (technicalReview) => technicalReview.instrumentId === fapInstrument.id
    );

  const assignmentColumns = [
    {
      title: 'Actions',
      cellStyle: { padding: 0, minWidth: 100 },
      sorting: false,
      field: 'rowActions',
    },
    {
      title: 'Title',
      field: 'proposalTitle',
    },
    {
      title: 'ID',
      field: 'proposal.proposalId',
    },
    {
      title: t('Fap') + ' meeting submitted',
      render: (rowData: FapProposal) => {
        const submitted = rowData.proposal.fapMeetingDecisions?.find(
          (fmd) => fmd.instrumentId === fapInstrument.id
        )?.submitted;

        return submitted ? 'Yes' : 'No';
      },
    },
    {
      title: 'Principal Investigator',
      render: (rowData: FapProposal) => {
        return getFullUserName(rowData.proposal.proposer);
      },
    },
    { title: 'Country', field: 'proposal.proposer.country' },
    {
      title: 'Average score',
      field: 'proposalAverageScore',
      emptyValue: '-',
    },
    {
      title: 'Deviation',
      field: 'proposalDeviation',
      customSort: (
        a: FapProposalWithAverageScoreAndAvailabilityZone,
        b: FapProposalWithAverageScoreAndAvailabilityZone
      ) =>
        (standardDeviation(getGradesFromReviews(a.proposal.reviews ?? [])) ||
          0) -
        (standardDeviation(getGradesFromReviews(b.proposal.reviews ?? [])) ||
          0),
    },
    {
      title: 'Current rank',
      render: (rowData: FapProposal) => {
        const rankOrder = rowData.proposal.fapMeetingDecisions?.find(
          (fmd) => fmd.instrumentId === fapInstrument.id
        )?.rankOrder;

        return rankOrder || '-';
      },
    },
    {
      title: 'Time allocation',
      field: 'timeAllocation',
      customSort: (
        a: FapProposalWithAverageScoreAndAvailabilityZone,
        b: FapProposalWithAverageScoreAndAvailabilityZone
      ) => {
        if (a.fapTimeAllocation && b.fapTimeAllocation) {
          return a.fapTimeAllocation - b.fapTimeAllocation;
        }

        const aReview = getInstrumentTechnicalReview(
          a.proposal.technicalReviews
        );
        const bReview = getInstrumentTechnicalReview(
          b.proposal.technicalReviews
        );

        if (aReview?.timeAllocation && bReview?.timeAllocation) {
          return aReview.timeAllocation - bReview.timeAllocation;
        } else {
          return -1;
        }
      },
    },
    {
      title: 'Recommendation',
      render: (rowData: FapProposal) => {
        const recommendation = rowData.proposal.fapMeetingDecisions?.find(
          (fmd) => fmd.instrumentId === fapInstrument.id
        )?.recommendation;

        return recommendation || 'Unset';
      },
    },
  ];

  // NOTE: This is needed for adding the allocation time unit information on the column title without causing some console warning on re-rendering.
  const columns = assignmentColumns.map((column) => ({
    ...column,
    title:
      column.field === 'timeAllocation'
        ? `${column.title} (${selectedCall?.allocationTimeUnit}s)`
        : column.title,
  }));

  const DragState = {
    row: -1,
    dropIndex: -1,
  };

  useEffect(() => {
    if (!loadingInstrumentProposals && fapInstrument.submitted) {
      refreshInstrumentProposalsData();
    }
    // NOTE: Should refresh proposals when we submit instrument to update rankings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fapInstrument.submitted]);

  const sortByRankOrder = (a: FapProposal, b: FapProposal) => {
    const fapMeetingDecisionA = a.proposal.fapMeetingDecisions?.find(
      (fmd) => fmd.instrumentId === fapInstrument.id
    );
    const fapMeetingDecisionB = b.proposal.fapMeetingDecisions?.find(
      (fmd) => fmd.instrumentId === fapInstrument.id
    );
    if (
      fapMeetingDecisionA?.rankOrder === fapMeetingDecisionB?.rankOrder ||
      (!fapMeetingDecisionA?.rankOrder && !fapMeetingDecisionB?.rankOrder)
    ) {
      return -1;
    } else if (!fapMeetingDecisionA?.rankOrder) {
      return 1;
    } else if (!fapMeetingDecisionB?.rankOrder) {
      return -1;
    } else {
      return (fapMeetingDecisionA?.rankOrder as number) >
        (fapMeetingDecisionB?.rankOrder as number)
        ? 1
        : -1;
    }
  };

  const [sortedProposalsWithAverageScore, setSortedProposalsWithAverageScore] =
    useState<FapProposalWithAverageScoreAndAvailabilityZone[]>([]);

  useEffect(() => {
    const sortByRankOrAverageScore = (data: FapProposal[]) => {
      let allocationTimeSum = 0;

      return data
        .map((proposalData) => {
          const proposalAverageScore = average(
            getGradesFromReviews(proposalData.proposal.reviews ?? [])
          );
          const proposalDeviation = standardDeviation(
            getGradesFromReviews(proposalData.proposal.reviews ?? [])
          );

          return {
            ...proposalData,
            proposalAverageScore: isNaN(proposalAverageScore)
              ? '-'
              : proposalAverageScore,
            proposalDeviation: isNaN(proposalDeviation)
              ? '-'
              : proposalDeviation,
          };
        })
        .sort((a, b) => {
          if (
            typeof a.proposalDeviation === 'number' &&
            typeof b.proposalDeviation === 'number'
          ) {
            return a.proposalDeviation < b.proposalDeviation ? 1 : -1;
          } else {
            return 1;
          }
        })
        .sort((a, b) => {
          if (
            typeof a.proposalAverageScore === 'number' &&
            typeof b.proposalAverageScore === 'number'
          ) {
            return a.proposalAverageScore > b.proposalAverageScore ? 1 : -1;
          } else {
            return -1;
          }
        })
        .sort(sortByRankOrder)
        .map((proposalData) => {
          const proposalAllocationTime =
            proposalData.fapTimeAllocation !== null
              ? proposalData.fapTimeAllocation
              : proposalData.proposal.technicalReviews?.find(
                  (technicalReview) =>
                    technicalReview.instrumentId === fapInstrument.id
                )?.timeAllocation || 0;

          if (
            allocationTimeSum + proposalAllocationTime >
            (fapInstrument.availabilityTime as number)
          ) {
            allocationTimeSum = allocationTimeSum + proposalAllocationTime;

            return {
              ...proposalData,
              isInAvailabilityZone: false,
            };
          } else {
            allocationTimeSum = allocationTimeSum + proposalAllocationTime;

            return {
              ...proposalData,
              isInAvailabilityZone: true,
            };
          }
        });
    };

    const sortedProposals = sortByRankOrAverageScore(instrumentProposalsData);
    setSortedProposalsWithAverageScore(sortedProposals);
  }, [instrumentProposalsData, fapInstrument.availabilityTime]);

  const ProposalTimeAllocationColumn = (
    rowData: FapProposalWithAverageScoreAndAvailabilityZone
  ) => {
    const instrumentTechnicalReview = rowData.proposal.technicalReviews?.find(
      (technicalReview) => technicalReview.instrumentId === fapInstrument.id
    );
    const timeAllocation = instrumentTechnicalReview
      ? instrumentTechnicalReview.timeAllocation
      : '-';

    const fapTimeAllocation = rowData.fapTimeAllocation;

    return (
      <>
        <Box
          component="span"
          sx={{
            ...(fapTimeAllocation !== null && {
              color: theme.palette.text.disabled,
            }),
          }}
        >
          {timeAllocation}
        </Box>
        {fapTimeAllocation && (
          <>
            <br />
            {fapTimeAllocation}
          </>
        )}
      </>
    );
  };

  const RowActionButtons = (rowData: FapProposal) => {
    const showViewIcon =
      !isFapReviewer ||
      rowData.assignments?.some(
        ({ fapMemberUserId }) => fapMemberUserId === user.id
      );

    return (
      <>
        {!fapInstrument.submitted && (
          <Tooltip title="Drag proposals to reorder" enterDelay={2000}>
            <IconButton
              style={{ cursor: 'grab' }}
              color="inherit"
              data-cy="drag-icon"
            >
              <DragHandle />
            </IconButton>
          </Tooltip>
        )}
        {showViewIcon && (
          <Tooltip title="View proposal details">
            <IconButton
              color="inherit"
              onClick={() => {
                setTypedParams((prev) => ({
                  ...prev,
                  fapMeetingModal: String(rowData.proposal.primaryKey),
                }));
                setOpenProposal(rowData.proposal);
              }}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
        )}
      </>
    );
  };

  const onMeetingSubmitted = (data: FapMeetingDecision) => {
    const newInstrumentProposalsData = instrumentProposalsData.map(
      (proposalData) => {
        if (proposalData.proposal.primaryKey === data.proposalPk) {
          return {
            ...proposalData,
            proposal: {
              ...proposalData.proposal,
              fapMeetingDecision: data,
            },
          };
        } else {
          return {
            ...proposalData,
          };
        }
      }
    );

    setInstrumentProposalsData(newInstrumentProposalsData as FapProposal[]);
  };

  const redBackgroundWhenOutOfAvailabilityZone = (
    isInsideAvailabilityZone: boolean
  ): React.CSSProperties =>
    isInsideAvailabilityZone
      ? {}
      : { backgroundColor: theme.palette.error.light };

  const updateAllProposalRankings = (proposals: FapProposal[]) => {
    const proposalsWithUpdatedRanking = proposals.map((item, index) => {
      const fapMeetingDecision = item.proposal.fapMeetingDecisions?.find(
        (fmd) => fmd.instrumentId === fapInstrument.id
      );

      // NOTE: Per instrument there is only one `fapMeetingDecision`. And when we load the proposals for this table we pass the `instrumentId` as input parameter to filter `fapMeetingDecisions` by instrument only.
      const fapMeetingDecisions = [
        {
          proposalPk: item.proposal.primaryKey,
          rankOrder: index + 1,
          commentForManagement:
            fapMeetingDecision?.commentForManagement || null,
          commentForUser: fapMeetingDecision?.commentForUser || null,
          recommendation: fapMeetingDecision?.recommendation || null,
          submitted: fapMeetingDecision?.submitted || false,
          submittedBy: fapMeetingDecision?.submittedBy || null,
          instrumentId: fapMeetingDecision?.instrumentId || fapInstrument.id,
          fapId: fapId,
        },
      ];

      return {
        ...item,
        proposal: {
          ...item.proposal,
          fapMeetingDecisions: fapMeetingDecisions,
        },
      };
    });

    return proposalsWithUpdatedRanking;
  };

  const reorderArray = (
    { fromIndex, toIndex }: { fromIndex: number; toIndex: number },
    originalArray: FapProposal[]
  ) => {
    const movedItem = originalArray.find((item, index) => index === fromIndex);

    if (!movedItem) {
      return originalArray;
    }

    const remainingItems = originalArray.filter(
      (item, index) => index !== fromIndex
    );

    const reorderedItems = [
      ...remainingItems.slice(0, toIndex),
      movedItem,
      ...remainingItems.slice(toIndex),
    ];

    return reorderedItems;
  };

  const reOrderRow = async (fromIndex: number, toIndex: number) => {
    const newTableData = reorderArray(
      { fromIndex, toIndex },
      sortedProposalsWithAverageScore
    );

    const tableDataWithRankingsUpdated =
      updateAllProposalRankings(newTableData);

    const reorderFapMeetingDecisionProposalsInput = tableDataWithRankingsUpdated
      .map((item) => ({
        proposalPk: item.proposal.primaryKey,
        rankOrder: item.proposal.fapMeetingDecisions.find(
          (fmd) => fmd.instrumentId === fapInstrument.id
        )?.rankOrder,
        instrumentId: fapInstrument.id,
        fapId: fapId,
      }))
      .filter(
        (fmd): fmd is ProposalPkWithRankOrder => fmd.rankOrder !== undefined
      );

    setInstrumentProposalsData(tableDataWithRankingsUpdated);
    const toastErrorMessageAction = (
      <Button
        color="inherit"
        variant="text"
        onClick={refreshInstrumentProposalsData}
        startIcon={<RefreshIcon />}
      >
        Refresh
      </Button>
    );

    await api({
      toastSuccessMessage: 'Reordering of proposals saved successfully!',
      toastErrorMessage:
        'Something went wrong please use refresh button to update the table state',
      // NOTE: Show error message with refresh button if there is an error.
      toastErrorMessageAction,
    }).reorderFapMeetingDecisionProposals({
      reorderFapMeetingDecisionProposalsInput: {
        proposals: reorderFapMeetingDecisionProposalsInput,
      },
    });
  };

  const showDropArea = (
    allRows: NodeListOf<HTMLTableRowElement>,
    sourcePosition: number,
    targetPosition: number
  ) => {
    allRows.forEach((row, index) => {
      row.classList.remove('shiftUp', 'shiftDown');
      if (sourcePosition < targetPosition) {
        if (index <= targetPosition && index >= sourcePosition) {
          row.classList.add('shiftUp');
        }
      } else if (sourcePosition > targetPosition) {
        if (index >= targetPosition && index <= sourcePosition) {
          row.classList.add('shiftDown');
        }
      }
    });
  };

  const handleOnRowDragStart = (
    e: DragEvent<HTMLTableRowElement>,
    tableDataId?: number
  ) => {
    if (tableDataId !== undefined) {
      e.currentTarget.classList.add('draggingRow');
      DragState.row = tableDataId;
    }
  };

  const handleOnRowDragEnter = (
    e: DragEvent<HTMLTableRowElement>,
    tableDataId?: number
  ) => {
    if (tableDataId === undefined) {
      return;
    }

    e.preventDefault();

    const tableBodyElement = e.currentTarget.parentElement;

    if (
      tableBodyElement &&
      DragState.dropIndex !== tableDataId &&
      DragState.row !== -1 &&
      DragState.row !== tableDataId
    ) {
      DragState.dropIndex = tableDataId;

      const allRows =
        tableBodyElement.childNodes as NodeListOf<HTMLTableRowElement>;

      showDropArea(allRows, DragState.row, DragState.dropIndex);
    }
  };

  const handleOnRowDragEnd = async (e: DragEvent<HTMLTableRowElement>) => {
    e.currentTarget.classList.remove('draggingRow');

    if (DragState.dropIndex !== -1 && DragState.dropIndex !== DragState.row) {
      await reOrderRow(DragState.row, DragState.dropIndex);
    }
    DragState.row = -1;
    DragState.dropIndex = -1;
  };

  const sortedProposalsWithAverageScoreAndId =
    sortedProposalsWithAverageScore.map((proposal) => ({
      ...proposal,
      id: proposal.proposalPk,
      rowActions: RowActionButtons(proposal),
      timeAllocation: ProposalTimeAllocationColumn(proposal),
      proposalTitle: (
        <Tooltip
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '200px',
          }}
          title={proposal.proposal.title}
          enterDelay={1000}
          enterNextDelay={1000}
        >
          <div>{proposal.proposal.title}</div>
        </Tooltip>
      ),
    }));

  const getAllocatedTimeSumToIndex = (lastRowIndex: number) => {
    let allocatedTimeSum = 0;
    for (let index = 0; index <= lastRowIndex; index++) {
      const element = sortedProposalsWithAverageScore[index];

      const proposalTimeAllocation =
        typeof element.fapTimeAllocation === 'number'
          ? element.fapTimeAllocation
          : element.proposal.technicalReviews?.find(
              (technicalReview) =>
                technicalReview.instrumentId === fapInstrument.id
            )?.timeAllocation || 0;

      allocatedTimeSum = allocatedTimeSum + proposalTimeAllocation;
    }

    return allocatedTimeSum;
  };

  /**  NOTE: Making this to work on mobile is a bit harder and might need more attention.
   * Here is some useful article (https://medium.com/@deepakkadarivel/drag-and-drop-dnd-for-mobile-browsers-fc9bcd1ad3c5)
   * And example https://github.com/deepakkadarivel/DnDWithTouch/blob/master/main.js
   */
  const RowDraggableComponent = (
    props: MaterialTableProps<FapProposalWithAverageScoreAndAvailabilityZone>
  ) => {
    let allocatedTime = 0;

    // NOTE: This is the best way for now to avoid using any type and use the right type.
    const rowData =
      props.data as unknown as FapProposalWithAverageScoreAndAvailabilityZone;

    const isLastAvailabilityZoneRow =
      rowData.isInAvailabilityZone &&
      rowData.tableData &&
      !sortedProposalsWithAverageScoreAndId[rowData?.tableData.index + 1]
        ?.isInAvailabilityZone;

    if (isLastAvailabilityZoneRow) {
      const lastRowIndex = rowData.tableData?.index;
      if (lastRowIndex !== undefined) {
        allocatedTime = getAllocatedTimeSumToIndex(lastRowIndex);
      }
    }

    const unallocatedTimeInformation = isLastAvailabilityZoneRow
      ? `Unallocated time: ${
          fapInstrument.availabilityTime
            ? fapInstrument.availabilityTime - allocatedTime
            : '-'
        } ${selectedCall?.allocationTimeUnit}s`
      : '';

    return (
      <MTableBodyRow
        {...props}
        unallocated-time-information={unallocatedTimeInformation}
        className={isLastAvailabilityZoneRow ? 'lastRowInAvailabilityZone' : ''}
        draggable={!fapInstrument.submitted}
        onDragStart={(e: DragEvent<HTMLTableRowElement>) =>
          handleOnRowDragStart(e, rowData.tableData?.id)
        }
        onDragEnter={(e: DragEvent<HTMLTableRowElement>) =>
          handleOnRowDragEnter(e, rowData.tableData?.id)
        }
        onDragEnd={handleOnRowDragEnd}
      />
    );
  };

  return (
    <Box sx={rootStyles} data-cy="fap-instrument-proposals-table">
      <FapMeetingProposalViewModal
        proposalViewModalOpen={
          !!fapMeetingModal && +fapMeetingModal === openProposal?.primaryKey
        }
        setProposalViewModalOpen={() => {
          setTypedParams((prev) => ({
            ...prev,
            fapMeetingModal: null,
          }));
          setOpenProposal(null);
          refreshInstrumentProposalsData();
        }}
        proposalPk={fapMeetingModal ? +fapMeetingModal : undefined}
        meetingSubmitted={onMeetingSubmitted}
        fapId={fapId}
        instrumentId={fapInstrument.id}
      />
      <MaterialTable
        icons={tableIcons}
        columns={columns}
        title={'Assigned reviewers'}
        data={sortedProposalsWithAverageScoreAndId}
        isLoading={loadingInstrumentProposals}
        components={{
          Row: RowDraggableComponent,
        }}
        options={{
          search: false,
          paging: false,
          toolbar: false,
          headerStyle: { backgroundColor: '#fafafa' },
          rowStyle: (rowData: FapProposalWithAverageScoreAndAvailabilityZone) =>
            redBackgroundWhenOutOfAvailabilityZone(
              rowData.isInAvailabilityZone
            ),
        }}
      />
    </Box>
  );
};

export default FapInstrumentProposalsTable;
