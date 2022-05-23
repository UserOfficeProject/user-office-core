import MaterialTable, {
  MaterialTableProps,
  MTableBodyRow,
} from '@material-table/core';
import DragHandle from '@mui/icons-material/DragHandle';
import RefreshIcon from '@mui/icons-material/Refresh';
import Visibility from '@mui/icons-material/Visibility';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import makeStyles from '@mui/styles/makeStyles';
import useTheme from '@mui/styles/useTheme';
import clsx from 'clsx';
import React, { useContext, DragEvent, useState, useEffect } from 'react';
import { NumberParam, useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import { UserContext } from 'context/UserContextProvider';
import {
  SepProposal,
  InstrumentWithAvailabilityTime,
  UserRole,
  SepMeetingDecision,
  Call,
} from 'generated/sdk';
import { useSEPProposalsByInstrument } from 'hooks/SEP/useSEPProposalsByInstrument';
import { tableIcons } from 'utils/materialIcons';
import {
  getGradesFromReviews,
  average,
  standardDeviation,
} from 'utils/mathFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import SEPMeetingProposalViewModal from './ProposalViewModal/SEPMeetingProposalViewModal';

type SepProposalWithAverageScoreAndAvailabilityZone = SepProposal & {
  proposalAverageScore: number | string;
  proposalDeviation: number | string;
  isInAvailabilityZone: boolean;
  tableData?: { index: number; id: number };
};

// NOTE: Some custom styles for row expand table.
const useStyles = makeStyles((theme) => ({
  root: {
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
  },
  disabled: {
    color: theme.palette.text.disabled,
  },
  proposalTitle: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '200px',
  },
}));

type SEPInstrumentProposalsTableProps = {
  sepInstrument: InstrumentWithAvailabilityTime;
  sepId: number;
  selectedCall?: Call;
};

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
  { title: 'Status', field: 'proposal.status.name' },
  {
    title: 'Average score',
    field: 'proposalAverageScore',
    emptyValue: '-',
  },
  {
    title: 'Deviation',
    field: 'proposalDeviation',
    customSort: (
      a: SepProposalWithAverageScoreAndAvailabilityZone,
      b: SepProposalWithAverageScoreAndAvailabilityZone
    ) =>
      (standardDeviation(getGradesFromReviews(a.proposal.reviews ?? [])) || 0) -
      (standardDeviation(getGradesFromReviews(b.proposal.reviews ?? [])) || 0),
  },
  {
    title: 'Current rank',
    field: 'proposal.sepMeetingDecision.rankOrder',
    emptyValue: '-',
  },
  {
    title: 'Time allocation',
    field: 'timeAllocation',
    customSort: (
      a: SepProposalWithAverageScoreAndAvailabilityZone,
      b: SepProposalWithAverageScoreAndAvailabilityZone
    ) => {
      if (a.sepTimeAllocation && b.sepTimeAllocation) {
        return a.sepTimeAllocation - b.sepTimeAllocation;
      }

      if (
        a.proposal.technicalReview?.timeAllocation &&
        b.proposal.technicalReview?.timeAllocation
      ) {
        return (
          a.proposal.technicalReview.timeAllocation -
          b.proposal.technicalReview.timeAllocation
        );
      } else {
        return -1;
      }
    },
  },
  {
    title: 'SEP meeting submitted',
    field: 'proposal.sepMeetingDecision.submitted',
    lookup: { true: 'Yes', false: 'No', undefined: 'No' },
  },
  {
    title: 'Recommendation',
    field: 'proposal.sepMeetingDecision.recommendation',
    emptyValue: 'Unset',
  },
];

const SEPInstrumentProposalsTable: React.FC<
  SEPInstrumentProposalsTableProps
> = ({ sepInstrument, sepId, selectedCall }) => {
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    sepMeetingModal: NumberParam,
  });
  const {
    instrumentProposalsData,
    loadingInstrumentProposals,
    setInstrumentProposalsData,
    refreshInstrumentProposalsData,
  } = useSEPProposalsByInstrument(sepInstrument.id, sepId, selectedCall?.id);
  const classes = useStyles();
  const theme = useTheme();
  const isSEPReviewer = useCheckAccess([UserRole.SEP_REVIEWER]);
  const { user } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();

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
    if (!loadingInstrumentProposals && sepInstrument.submitted) {
      refreshInstrumentProposalsData();
    }
    // NOTE: Should refresh proposals when we submit instrument to update rankings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sepInstrument.submitted]);

  const sortByRankOrder = (a: SepProposal, b: SepProposal) => {
    if (
      a.proposal.sepMeetingDecision?.rankOrder ===
        b.proposal.sepMeetingDecision?.rankOrder ||
      (!a.proposal.sepMeetingDecision?.rankOrder &&
        !b.proposal.sepMeetingDecision?.rankOrder)
    ) {
      return -1;
    } else if (!a.proposal.sepMeetingDecision?.rankOrder) {
      return 1;
    } else if (!b.proposal.sepMeetingDecision?.rankOrder) {
      return -1;
    } else {
      return (a.proposal.sepMeetingDecision?.rankOrder as number) >
        (b.proposal.sepMeetingDecision?.rankOrder as number)
        ? 1
        : -1;
    }
  };

  const [sortedProposalsWithAverageScore, setSortedProposalsWithAverageScore] =
    useState<SepProposalWithAverageScoreAndAvailabilityZone[]>([]);

  useEffect(() => {
    const sortByRankOrAverageScore = (data: SepProposal[]) => {
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
            proposalData.sepTimeAllocation !== null
              ? proposalData.sepTimeAllocation
              : proposalData.proposal.technicalReview?.timeAllocation || 0;

          if (
            allocationTimeSum + proposalAllocationTime >
            (sepInstrument.availabilityTime as number)
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
  }, [instrumentProposalsData, sepInstrument.availabilityTime]);

  const ProposalTimeAllocationColumn = (
    rowData: SepProposalWithAverageScoreAndAvailabilityZone
  ) => {
    const timeAllocation =
      rowData.proposal.technicalReview &&
      rowData.proposal.technicalReview.timeAllocation
        ? rowData.proposal.technicalReview.timeAllocation
        : '-';

    const sepTimeAllocation = rowData.sepTimeAllocation;

    return (
      <>
        <span
          className={clsx({
            [classes.disabled]: sepTimeAllocation !== null,
          })}
        >
          {timeAllocation}
        </span>
        {sepTimeAllocation && (
          <>
            <br />
            {sepTimeAllocation}
          </>
        )}
      </>
    );
  };

  const RowActionButtons = (rowData: SepProposal) => {
    const showViewIcon =
      !isSEPReviewer ||
      rowData.assignments?.some(
        ({ sepMemberUserId }) => sepMemberUserId === user.id
      );

    return (
      <>
        <Tooltip title="Drag proposals to reorder" enterDelay={2000}>
          <IconButton
            style={{ cursor: 'grab' }}
            color="inherit"
            data-cy="drag-icon"
          >
            <DragHandle />
          </IconButton>
        </Tooltip>
        {showViewIcon && (
          <Tooltip title="View proposal details">
            <IconButton
              color="inherit"
              onClick={() =>
                setUrlQueryParams({
                  sepMeetingModal: rowData.proposal.primaryKey,
                })
              }
            >
              <Visibility />
            </IconButton>
          </Tooltip>
        )}
      </>
    );
  };

  const onMeetingSubmitted = (data: SepMeetingDecision) => {
    const newInstrumentProposalsData = instrumentProposalsData.map(
      (proposalData) => {
        if (proposalData.proposal.primaryKey === data.proposalPk) {
          return {
            ...proposalData,
            proposal: {
              ...proposalData.proposal,
              sepMeetingDecision: data,
            },
          };
        } else {
          return {
            ...proposalData,
          };
        }
      }
    );

    setInstrumentProposalsData(newInstrumentProposalsData as SepProposal[]);
  };

  const redBackgroundWhenOutOfAvailabilityZone = (
    isInsideAvailabilityZone: boolean
  ): React.CSSProperties =>
    isInsideAvailabilityZone
      ? {}
      : { backgroundColor: theme.palette.error.light };

  const updateAllProposalRankings = (proposals: SepProposal[]) => {
    const proposalsWithUpdatedRanking = proposals.map((item, index) => ({
      ...item,
      proposal: {
        ...item.proposal,
        sepMeetingDecision: {
          proposalPk: item.proposal.primaryKey,
          rankOrder: index + 1,
          commentForManagement:
            item.proposal.sepMeetingDecision?.commentForManagement || null,
          commentForUser:
            item.proposal.sepMeetingDecision?.commentForUser || null,
          recommendation:
            item.proposal.sepMeetingDecision?.recommendation || null,
          submitted: item.proposal.sepMeetingDecision?.submitted || false,
          submittedBy: item.proposal.sepMeetingDecision?.submittedBy || null,
        },
      },
    }));

    return proposalsWithUpdatedRanking;
  };

  const reorderArray = (
    { fromIndex, toIndex }: { fromIndex: number; toIndex: number },
    originalArray: SepProposal[]
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

    const reorderSepMeetingDecisionProposalsInput =
      tableDataWithRankingsUpdated.map((item) => ({
        proposalPk: item.proposal.primaryKey,
        rankOrder: item.proposal.sepMeetingDecision?.rankOrder,
      }));

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
    }).reorderSepMeetingDecisionProposals({
      reorderSepMeetingDecisionProposalsInput: {
        proposals: reorderSepMeetingDecisionProposalsInput,
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
          className={classes.proposalTitle}
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
        typeof element.sepTimeAllocation === 'number'
          ? element.sepTimeAllocation
          : element.proposal.technicalReview?.timeAllocation || 0;

      allocatedTimeSum = allocatedTimeSum + proposalTimeAllocation;
    }

    return allocatedTimeSum;
  };

  /**  NOTE: Making this to work on mobile is a bit harder and might need more attention.
   * Here is some useful article (https://medium.com/@deepakkadarivel/drag-and-drop-dnd-for-mobile-browsers-fc9bcd1ad3c5)
   * And example https://github.com/deepakkadarivel/DnDWithTouch/blob/master/main.js
   */
  const RowDraggableComponent = (
    props: MaterialTableProps<SepProposalWithAverageScoreAndAvailabilityZone>
  ) => {
    let allocatedTime = 0;

    // NOTE: This is the best way for now to avoid using any type and use the right type.
    const rowData =
      props.data as unknown as SepProposalWithAverageScoreAndAvailabilityZone;

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
          sepInstrument.availabilityTime
            ? sepInstrument.availabilityTime - allocatedTime
            : '-'
        } ${selectedCall?.allocationTimeUnit}s`
      : '';

    return (
      <MTableBodyRow
        {...props}
        unallocated-time-information={unallocatedTimeInformation}
        className={isLastAvailabilityZoneRow ? 'lastRowInAvailabilityZone' : ''}
        draggable
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
    <div className={classes.root} data-cy="sep-instrument-proposals-table">
      <SEPMeetingProposalViewModal
        proposalViewModalOpen={!!urlQueryParams.sepMeetingModal}
        setProposalViewModalOpen={() => {
          setUrlQueryParams({ sepMeetingModal: undefined });
          refreshInstrumentProposalsData();
        }}
        proposalPk={urlQueryParams.sepMeetingModal}
        meetingSubmitted={onMeetingSubmitted}
        sepId={sepId}
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
          rowStyle: (rowData: SepProposalWithAverageScoreAndAvailabilityZone) =>
            redBackgroundWhenOutOfAvailabilityZone(
              rowData.isInAvailabilityZone
            ),
        }}
      />
    </div>
  );
};

export default SEPInstrumentProposalsTable;
