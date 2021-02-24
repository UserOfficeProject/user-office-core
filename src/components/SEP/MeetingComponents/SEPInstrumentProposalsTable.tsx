import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import Visibility from '@material-ui/icons/Visibility';
import clsx from 'clsx';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React, { useState, useContext } from 'react';

import { useCheckAccess } from 'components/common/Can';
import { AdministrationFormData } from 'components/proposal/ProposalAdmin';
import { UserContext } from 'context/UserContextProvider';
import {
  SepProposal,
  InstrumentWithAvailabilityTime,
  UserRole,
} from 'generated/sdk';
import { useSEPProposalsByInstrument } from 'hooks/SEP/useSEPProposalsByInstrument';
import { tableIcons } from 'utils/materialIcons';
import { getGrades, average } from 'utils/mathFunctions';

import SEPMeetingProposalViewModal from './ProposalViewModal/SEPMeetingProposalViewModal';

// NOTE: Some custom styles for row expand table.
const useStyles = makeStyles(theme => ({
  root: {
    '& tr:last-child td': {
      border: 'none',
    },
    '& .MuiPaper-root': {
      padding: '0 40px',
      backgroundColor: '#fafafa',
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

const SEPInstrumentProposalsTable: React.FC<SEPInstrumentProposalsTableProps> = ({
  sepInstrument,
  sepId,
  selectedCallId,
}) => {
  const {
    instrumentProposalsData,
    loadingInstrumentProposals,
    setInstrumentProposalsData,
    refreshInstrumentProposalsData,
  } = useSEPProposalsByInstrument(sepInstrument.id, sepId, selectedCallId);
  const classes = useStyles();
  const theme = useTheme();
  const [openProposalId, setOpenProposalId] = useState<number | null>(null);
  const isSEPReviewer = useCheckAccess([UserRole.SEP_REVIEWER]);
  const { user } = useContext(UserContext);

  const sortByRankOrder = (a: SepProposal, b: SepProposal) => {
    if (a.proposal.rankOrder === b.proposal.rankOrder) {
      return -1;
    } else if (a.proposal.rankOrder === null) {
      return 1;
    } else if (b.proposal.rankOrder === null) {
      return -1;
    } else {
      return a.proposal.rankOrder > b.proposal.rankOrder ? 1 : -1;
    }
  };

  const sortByRankOrAverageScore = (data: SepProposal[]) => {
    let allocationTimeSum = 0;

    return data
      .map(proposalData => {
        const proposalAverageScore =
          average(getGrades(proposalData.proposal.reviews) as number[]) || 0;

        return {
          ...proposalData,
          proposalAverageScore,
        };
      })
      .sort((a, b) =>
        a.proposalAverageScore > b.proposalAverageScore ? 1 : -1
      )
      .sort(sortByRankOrder)
      .map(proposalData => {
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
            isInAvailabilityZone: false,
            ...proposalData,
          };
        } else {
          allocationTimeSum = allocationTimeSum + proposalAllocationTime;

          return {
            isInAvailabilityZone: true,
            ...proposalData,
          };
        }
      });
  };

  const proposalTimeAllocationColumn = (
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

  const assignmentColumns = [
    {
      title: 'Title',
      field: 'proposal.title',
    },
    {
      title: 'ID',
      field: 'proposal.shortCode',
    },
    { title: 'Status', field: 'proposal.status.name' },
    {
      title: 'Initial rank (by average score)',
      render: (
        rowData: SepProposal & {
          proposalAverageScore: number;
        }
      ) => (rowData.proposalAverageScore ? rowData.proposalAverageScore : '-'),
    },
    {
      title: 'Current rank',
      render: (rowData: SepProposal) =>
        rowData.proposal.rankOrder ? rowData.proposal.rankOrder : '-',
    },
    {
      title: 'Time allocation',
      render: (
        rowData: SepProposal & {
          proposalAverageScore: number;
        }
      ) => proposalTimeAllocationColumn(rowData),
    },
    {
      title: 'Review meeting',
      render: (rowData: SepProposal): string =>
        rowData.proposal.rankOrder ? 'Yes' : 'No',
    },
  ];

  const onMeetingSubmitted = (data: AdministrationFormData) => {
    const newInstrumentProposalsData = instrumentProposalsData.map(
      proposalData => {
        if (proposalData.proposal.id === data.id) {
          return {
            ...proposalData,
            proposal: {
              ...proposalData.proposal,
              ...data,
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

  const sortedProposalsWithAverageScore = sortByRankOrAverageScore(
    instrumentProposalsData
  );

  const ViewIcon = (): JSX.Element => <Visibility />;

  const redBackgroundWhenOutOfAvailabilityZone = (
    isInsideAvailabilityZone: boolean
  ): CSSProperties =>
    isInsideAvailabilityZone
      ? {}
      : { backgroundColor: theme.palette.error.light };

  return (
    <div className={classes.root} data-cy="sep-instrument-proposals-table">
      <SEPMeetingProposalViewModal
        proposalViewModalOpen={!!openProposalId}
        setProposalViewModalOpen={() => {
          setOpenProposalId(null);
          refreshInstrumentProposalsData();
        }}
        proposalId={openProposalId || 0}
        meetingSubmitted={onMeetingSubmitted}
        sepId={sepId}
      />
      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={'Assigned reviewers'}
        data={sortedProposalsWithAverageScore}
        isLoading={loadingInstrumentProposals}
        actions={[
          rowData => ({
            icon: ViewIcon,
            onClick: (event, data) => {
              setOpenProposalId((data as SepProposal).proposal.id);
            },
            tooltip: 'View proposal details',
            hidden:
              isSEPReviewer &&
              !rowData.assignments?.some(
                ({ sepMemberUserId }) => sepMemberUserId === user.id
              ),
          }),
        ]}
        options={{
          search: false,
          paging: false,
          toolbar: false,
          headerStyle: { backgroundColor: '#fafafa' },
          rowStyle: (
            rowData: SepProposal & {
              proposalAverageScore: number;
              isInAvailabilityZone: boolean;
            }
          ) =>
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
