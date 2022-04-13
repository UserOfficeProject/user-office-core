import MaterialTable, { MTableBodyRow } from '@material-table/core';
import DragHandle from '@mui/icons-material/DragHandle';
import Visibility from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import makeStyles from '@mui/styles/makeStyles';
import useTheme from '@mui/styles/useTheme';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { useContext, DragEvent, useState, useEffect } from 'react';
import { NumberParam, useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import { UserContext } from 'context/UserContextProvider';
import {
  SepProposal,
  InstrumentWithAvailabilityTime,
  UserRole,
  SepMeetingDecision,
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
  proposalAverageScore: number;
  isInAvailabilityZone: boolean;
};

// NOTE: Some custom styles for row expand table.
const useStyles = makeStyles((theme) => ({
  root: {
    '& tr:last-child td': {
      border: 'none',
    },
    '& .MuiPaper-root': {
      padding: '0 40px',
      backgroundColor: '#fafafa',
    },
    '& .draggingRow': {
      backgroundColor: `${theme.palette.warning.light} !important`,
    },
    '& .droppableAreaRow': {
      height: '0px',
      backgroundColor: theme.palette.grey[300],
      transition: '0.1s',
      textAlign: 'center',
      color: theme.palette.grey[600],

      '&.droppableAreaAnimate': {
        height: '50px',
      },
    },
  },
  disabled: {
    color: theme.palette.text.disabled,
  },
}));

type SEPInstrumentProposalsTableProps = {
  sepInstrument: InstrumentWithAvailabilityTime;
  sepId: number;
  selectedCallId: number;
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
    field: 'proposal.title',
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
    field: 'deviation',
    render: (
      rowData: SepProposalWithAverageScoreAndAvailabilityZone
    ): string => {
      const stdDeviation = standardDeviation(
        getGradesFromReviews(rowData.proposal.reviews ?? [])
      );

      return isNaN(stdDeviation) ? '-' : `${stdDeviation}`;
    },
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
    render: (rowData: SepProposalWithAverageScoreAndAvailabilityZone): string =>
      rowData.proposal.sepMeetingDecision?.submitted ? 'Yes' : 'No',
  },
  {
    title: 'Recommendation',
    field: 'proposal.sepMeetingDecision.recommendation',
    emptyValue: 'Unset',
  },
];

const SEPInstrumentProposalsTable: React.FC<
  SEPInstrumentProposalsTableProps
> = ({ sepInstrument, sepId, selectedCallId }) => {
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    sepMeetingModal: NumberParam,
  });
  const {
    instrumentProposalsData,
    loadingInstrumentProposals,
    setInstrumentProposalsData,
    refreshInstrumentProposalsData,
  } = useSEPProposalsByInstrument(sepInstrument.id, sepId, selectedCallId);
  const classes = useStyles();
  const theme = useTheme();
  const isSEPReviewer = useCheckAccess([UserRole.SEP_REVIEWER]);
  const { user } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const [savingOrder, setSavingOrder] = useState(false);

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

          return {
            ...proposalData,
            proposalAverageScore,
          };
        })
        .sort((a, b) =>
          a.proposalAverageScore > b.proposalAverageScore ? 1 : -1
        )
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
    rowData: SepProposal & {
      proposalAverageScore: number;
    }
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
        <Tooltip title="Drag proposals to reorder">
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
    setSavingOrder(true);
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

    const result = await api(
      'Reordering of proposals saved successfully!'
    ).reorderSepMeetingDecisionProposals({
      reorderSepMeetingDecisionProposalsInput: {
        proposals: reorderSepMeetingDecisionProposalsInput,
      },
    });

    if (!result.reorderSepMeetingDecisionProposals.rejection) {
      setInstrumentProposalsData(tableDataWithRankingsUpdated);
    }

    setSavingOrder(false);
  };

  const createDroppableAreaRow = () => {
    const doppableAreaRow = document.createElement('tr');
    doppableAreaRow.className = 'droppableAreaRow';
    // NOTE: Full width column is needed to set proper background
    const doppableAreaColumn = document.createElement('td');
    doppableAreaColumn.colSpan = assignmentColumns.length;
    doppableAreaColumn.textContent = 'Drop here';
    doppableAreaRow.appendChild(doppableAreaColumn);

    return doppableAreaRow;
  };

  const insertDroppableAreaRowIntoTable = (
    tableBodyElement: HTMLElement,
    allTableRowElements: Element[],
    droppableAreaRowElement: HTMLTableRowElement
  ) => {
    if (DragState.dropIndex === sortedProposalsWithAverageScore.length - 1) {
      tableBodyElement.appendChild(droppableAreaRowElement);
    } else if (
      DragState.dropIndex === 0 ||
      DragState.row === DragState.dropIndex + 1
    ) {
      tableBodyElement.insertBefore(
        droppableAreaRowElement,
        allTableRowElements[DragState.dropIndex]
      );
    } else {
      tableBodyElement.insertBefore(
        droppableAreaRowElement,
        allTableRowElements[DragState.dropIndex + 1]
      );
    }
  };

  const handleOnRowDragStart = (
    e: DragEvent<HTMLTableRowElement>,
    tableDataId: number
  ) => {
    e.currentTarget.classList.add('draggingRow');
    DragState.row = tableDataId;
  };

  const handleOnRowDragEnter = (
    e: DragEvent<HTMLTableRowElement>,
    tableDataId: number
  ) => {
    e.preventDefault();

    const tableBodyElement = e.currentTarget.parentElement;

    if (tableBodyElement && DragState.dropIndex !== tableDataId) {
      const allTableRowElements = Array.from(tableBodyElement.children);

      const droppableAreaSeparatorToRemove = allTableRowElements.find(
        (element, index) => {
          if (element.className.includes('droppableAreaRow')) {
            allTableRowElements.splice(index, 1);

            return element;
          }
        }
      );

      if (droppableAreaSeparatorToRemove) {
        tableBodyElement.removeChild(droppableAreaSeparatorToRemove);
      }

      DragState.dropIndex = tableDataId;

      if (DragState.row === DragState.dropIndex) {
        return;
      }

      const droppableAreaRowElement = createDroppableAreaRow();

      insertDroppableAreaRowIntoTable(
        tableBodyElement,
        allTableRowElements,
        droppableAreaRowElement
      );

      // NOTE: Add class with timeout to be able to animate.
      setTimeout(
        () => droppableAreaRowElement.classList.add('droppableAreaAnimate'),
        100
      );
    }
  };

  const handleOnRowDragEnd = async (e: DragEvent<HTMLTableRowElement>) => {
    e.currentTarget.classList.remove('draggingRow');

    if (DragState.dropIndex !== -1 && DragState.dropIndex !== DragState.row) {
      const tableBodyElement = e.currentTarget.parentElement;

      if (tableBodyElement) {
        const allTableRowElements = Array.from(tableBodyElement.children);
        const elToRemove = allTableRowElements.find((element) =>
          element.className.includes('droppableAreaRow')
        );

        if (elToRemove) {
          tableBodyElement.removeChild(elToRemove);
        }
      }

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
    }));

  /**  NOTE: Making this to work on mobile is a bit harder and might need more attention.
   * Here is some useful article (https://medium.com/@deepakkadarivel/drag-and-drop-dnd-for-mobile-browsers-fc9bcd1ad3c5)
   * And example https://github.com/deepakkadarivel/DnDWithTouch/blob/master/main.js
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const RowDraggableComponent = (props: any) => (
    <MTableBodyRow
      {...props}
      draggable="true"
      onDragStart={(e: DragEvent<HTMLTableRowElement>) =>
        handleOnRowDragStart(e, props.data.tableData.id)
      }
      onDragEnter={(e: DragEvent<HTMLTableRowElement>) =>
        handleOnRowDragEnter(e, props.data.tableData.id)
      }
      onDragEnd={handleOnRowDragEnd}
    />
  );

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
        columns={assignmentColumns}
        title={'Assigned reviewers'}
        data={sortedProposalsWithAverageScoreAndId}
        isLoading={loadingInstrumentProposals || savingOrder}
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

SEPInstrumentProposalsTable.propTypes = {
  sepInstrument: PropTypes.any.isRequired,
  sepId: PropTypes.number.isRequired,
  selectedCallId: PropTypes.number.isRequired,
};

export default SEPInstrumentProposalsTable;
