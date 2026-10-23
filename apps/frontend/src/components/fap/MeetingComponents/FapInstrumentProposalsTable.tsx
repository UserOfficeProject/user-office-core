import MaterialTable, {
  MaterialTableProps,
  MTableBodyRow,
} from '@material-table/core';
import Visibility from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { UserContext } from 'context/UserContextProvider';
import {
  FapProposal,
  InstrumentWithAvailabilityTime,
  UserRole,
  FapMeetingDecision,
  Call,
  Proposal,
  TechnicalReview,
} from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useFapMeetingScoringConfig } from 'hooks/fap/useFapMeetingScoringConfig';
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
import { validate } from 'graphql';

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
  selectedCall: Call;
};

const FapInstrumentProposalsTable = ({
  fapInstrument,
  fapId,
  selectedCall,
}: FapInstrumentProposalsTableProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const fapMeetingModal = searchParams.get('fapMeetingModal');

  const {
    instrumentProposalsData,
    loadingInstrumentProposals,
    setInstrumentProposalsData,
    refreshInstrumentProposalsData,
  } = useFapProposalsByInstrument(fapInstrument.id, fapId, selectedCall?.id);

  const theme = useTheme();
  const isFapReviewer = useCheckAccess([UserRole.FAP_REVIEWER]);
  const { user } = useContext(UserContext);
  const [openProposal, setOpenProposal] = useState<Proposal | null>(null);
  const { t } = useTranslation();
  const { scoringConfig } = useFapMeetingScoringConfig(selectedCall.id);
  const { api } = useDataApiWithFeedback();

  const getInstrumentTechnicalReview = (
    technicalReviews: TechnicalReview[] | null
  ) =>
    technicalReviews?.find(
      (technicalReview) => technicalReview.instrumentId === fapInstrument.id
    );

  const assignmentColumns = [
    {
      title: 'Actions',
      sorting: false,
      field: 'rowActions',
    },
    {
      title: 'Title',
      field: 'proposalTitle',
      width: 150,
    },
    {
      title: 'ID',
      field: 'proposal.proposalId',
    },
    {
      title: 'Average score',
      field: 'proposalAverageScore',
      emptyValue: '-',
      render: (
        rowData: FapProposal & { proposalAverageScore: number | string }
      ) => {
        const classificationGrades = rowData.proposal.reviews
          ?.map((rev) => rev.grade)
          .filter((grade) => isNaN(Number(grade)));

        if (classificationGrades && classificationGrades?.length > 0) {
          return `${rowData.proposalAverageScore} ${classificationGrades?.toString()}`;
        }

        return rowData.proposalAverageScore ?? '-';
      },
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
      title: 'Current Score',
      field: 'meetingScore',
      render: (rowData: FapProposal) => {
        const meetingScore = rowData.proposal.fapMeetingDecisions?.find(
          (fmd) => fmd.recommendedInstrumentId === fapInstrument.id
        )?.meetingScore;

        return meetingScore || '-';
      },
    },
    {
      title: t('FAP') + ' meeting submitted',
      render: (rowData: FapProposal) => {
        const submitted = rowData.proposal.fapMeetingDecisions?.find(
          (fmd) => fmd.recommendedInstrumentId === fapInstrument.id
        )?.submitted;

        return submitted ? 'Yes' : 'No';
      },
    },
    {
      title: 'Principal investigator',
      render: (rowData: FapProposal) => {
        return getFullUserName(rowData.proposal.proposer);
      },
    },
    { title: 'Country', field: 'proposal.proposer.country' },
    {
      title: `Time requested (${selectedCall?.allocationTimeUnit}s)`,
      field: 'proposalTimeRequested',
    },
    {
      title: `Time Allocation (${selectedCall?.allocationTimeUnit}s)`,
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
          (fmd) => fmd.recommendedInstrumentId === fapInstrument.id
        )?.recommendation;

        return recommendation || 'Unset';
      },
    },
  ];

  useEffect(() => {
    if (!loadingInstrumentProposals && fapInstrument.submitted) {
      refreshInstrumentProposalsData();
    }
    // NOTE: Should refresh proposals when we submit instrument to update rankings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fapInstrument.submitted]);

  type FapProposalWithStats = FapProposal & {
    proposalAverageScore: number | string;
    proposalDeviation: number | string;
  };

  // We have a base assumption that classification means that the proposals cannot be scored therefore it will be rejected
  const sortByMeetingScore = (
    a: FapProposalWithStats,
    b: FapProposalWithStats
  ) => {
    const fapMeetingDecisionA = a.proposal.fapMeetingDecisions?.find(
      (fmd) => fmd.recommendedInstrumentId === fapInstrument.id
    )?.meetingScore;
    const fapMeetingDecisionB = b.proposal.fapMeetingDecisions?.find(
      (fmd) => fmd.recommendedInstrumentId === fapInstrument.id
    )?.meetingScore;

    const aAverage = a.proposalAverageScore;
    const bAverage = b.proposalAverageScore;
    const scoreA = fapMeetingDecisionA ?? aAverage;
    const scoreB = fapMeetingDecisionB ?? bAverage;
    const numericScoreA = Number(scoreA);
    const numericScoreB = Number(scoreB);
    const isAClassification =
      scoreA != null && scoreA !== '' && isNaN(numericScoreA);
    const isBClassification =
      scoreB != null && scoreB !== '' && isNaN(numericScoreB);

    // Check if no reviews have been done
    if (isNaN(numericScoreA) && isNaN(numericScoreB)) {
      return 0;
    }
    if (isNaN(numericScoreA)) {
      return 1;
    }
    if (isNaN(numericScoreB)) {
      return -1;
    }

    if (isAClassification && isBClassification) {
      return String(scoreA).localeCompare(String(scoreB));
    }
    if (isAClassification) {
      return 1;
    }
    if (isBClassification) {
      return -1;
    }

    if (numericScoreA === numericScoreB) {
      if (
        typeof a.proposalDeviation === 'number' &&
        typeof b.proposalDeviation === 'number'
      ) {
        return a.proposalDeviation < b.proposalDeviation ? -1 : 1;
      } else {
        return 1;
      }
    }

    return numericScoreB - numericScoreA;
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
        .sort(sortByMeetingScore)
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

    const run = async () => {
      const sortedProposals = sortByRankOrAverageScore(instrumentProposalsData);
      setSortedProposalsWithAverageScore(sortedProposals);
    };

    if (instrumentProposalsData.length) {
      run();
    }
  }, [instrumentProposalsData, fapInstrument.availabilityTime]);

  const updateMeetingScore = (
    newScore: string,
    fapProposalId: number,
    proposalPk: number
  ) => {
    return api().saveFapMeetingDecision({
      saveFapMeetingDecisionInput: {
        commentForManagement: undefined,
        commentForUser: undefined,
        fapId: fapId,
        fapProposalId: fapProposalId,
        meetingScore: newScore,
        proposalPk: proposalPk,
        rankOrder: undefined,
        recommendation: undefined,
        recommendedInstrumentId: fapInstrument.id, //Needs updating when #1046 is done
        recommendedTimeAllocation: undefined,
        submitted: undefined,
      },
    });
  };

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
        {fapTimeAllocation && <>{fapTimeAllocation}</>}
        <Box
          component="span"
          sx={{
            ...(fapTimeAllocation !== null && {
              color: theme.palette.text.disabled,
            }),
          }}
        >
          {`${fapTimeAllocation !== null ? ' (Technical Review Allocation: ' : ''}${timeAllocation}${
            fapTimeAllocation !== null ? ')' : ''
          }`}
        </Box>
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
        {showViewIcon && (
          <Tooltip title="View proposal details">
            <IconButton
              color="inherit"
              onClick={() => {
                setSearchParams((searchParams) => {
                  searchParams.set(
                    'fapMeetingModal',
                    String(rowData.proposal.primaryKey)
                  );

                  return searchParams;
                });
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
          <div
            style={{
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {proposal.proposal.title}
          </div>
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
          setSearchParams((searchParams) => {
            searchParams.delete('fapMeetingModal');

            return searchParams;
          });
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
        columns={assignmentColumns}
        title={`${fapInstrument.name} - ${fapInstrument.availabilityTime} ${selectedCall?.allocationTimeUnit}(s) Available`}
        data={sortedProposalsWithAverageScoreAndId}
        isLoading={loadingInstrumentProposals}
        components={{
          Row: RowDraggableComponent,
        }}
        options={{
          columnsButton: true,
          search: false,
          paging: false,
          toolbar: true,
          headerStyle: { backgroundColor: '#fafafa' },
          rowStyle: (rowData: FapProposalWithAverageScoreAndAvailabilityZone) =>
            redBackgroundWhenOutOfAvailabilityZone(
              rowData.isInAvailabilityZone
            ),
        }}
        cellEditable={{
          isCellEditable: (rowData, columnDef) =>
            columnDef.field === 'meetingScore',
          onCellEditApproved: (newValue, oldValue, rowData) => {
            return new Promise<void>((resolve, reject) => {
              if (isNaN(Number(newValue))) {
                if (
                  scoringConfig.nonNumericOptions.some(
                    (option) => option === newValue
                  )
                ) {
                  return updateMeetingScore(
                    newValue.toString(),
                    rowData.fapProposalId,
                    rowData.proposal.primaryKey
                  ).then(() => {
                    refreshInstrumentProposalsData();

                    return resolve();
                  });
                }
                reject();
              } else {
                const newValueNumber = Number(newValue);
                const inRange =
                  newValueNumber >= scoringConfig.minGrade &&
                  newValueNumber <= scoringConfig.maxGrade;
                const hasValidPrecision =
                  (newValueNumber.toString().split('.')[1] || '').length <=
                  scoringConfig.decimalPoints;

                if (inRange && hasValidPrecision) {
                  return updateMeetingScore(
                    newValue.toString(),
                    rowData.fapProposalId,
                    rowData.proposal.primaryKey
                  ).then(() => {
                    refreshInstrumentProposalsData();

                    return resolve();
                  });
                }
                reject();
              }
            });
          },
        }}
      />
    </Box>
  );
};

export default FapInstrumentProposalsTable;
