import { makeStyles } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Visibility } from '@material-ui/icons';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import {
  SepProposal,
  Proposal,
  ReviewStatus,
  InstrumentWithAvailabilityTime,
} from 'generated/sdk';
import { useSEPProposalsByInstrument } from 'hooks/SEP/useSEPProposalsByInstrument';
import { tableIcons } from 'utils/materialIcons';

import SEPMeetingProposalViewModal from './ProposalViewModal/SEPMeetingProposalViewModal';

// NOTE: Some custom styles for row expand table.
const useStyles = makeStyles(() => ({
  root: {
    '& tr:last-child td': {
      border: 'none',
    },
    '& .MuiPaper-root': {
      padding: '0 40px',
      backgroundColor: '#fafafa',
    },
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
  } = useSEPProposalsByInstrument(sepInstrument.id, sepId, selectedCallId);
  const classes = useStyles();
  const theme = useTheme();
  const [openProposalId, setOpenProposalId] = useState<number | null>(null);

  if (loadingInstrumentProposals) {
    return <div>Loading...</div>;
  }

  const getGrades = (proposal: Proposal) =>
    proposal.reviews
      ?.filter(review => review.status === ReviewStatus.SUBMITTED)
      .map(review => review.grade) ?? [];

  const average = (numbers: number[]) => {
    const sum = numbers.reduce(function(sum, value) {
      return sum + value;
    }, 0);

    const avg = sum / numbers.length;

    return avg.toPrecision(3);
  };

  let allocationTimeSum = 0;
  const proposalsWithAverageScore = instrumentProposalsData
    .map(proposalData => {
      const proposalAverageScore = +average(
        getGrades(proposalData.proposal) as number[]
      );

      return {
        ...proposalData,
        proposalAverageScore,
      };
    })
    .sort((a, b) => (a.proposalAverageScore < b.proposalAverageScore ? 1 : -1))
    .map(proposalData => {
      const proposalAllocationTime =
        proposalData.proposal.technicalReview?.timeAllocation || 0;

      if (
        allocationTimeSum + proposalAllocationTime >
        (sepInstrument.availabilityTime as number)
      ) {
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
  // TODO: Should add this currentRank on proposal or SepProposal.
  // .sort((a, b) => (a.currentRank > b.currentRank ? 1 : -1));

  const assignmentColumns = [
    {
      title: 'Title',
      field: 'proposal.title',
    },
    {
      title: 'ID',
      field: 'proposal.shortCode',
    },
    { title: 'Status', field: 'proposal.status' },
    {
      title: 'Initial rank',
      render: (
        rowData: SepProposal & {
          proposalAverageScore: number;
        }
      ) => (rowData.proposalAverageScore ? rowData.proposalAverageScore : '-'),
    },
    {
      title: 'Current rank',
      // render: (rowData: SepProposal) =>
      //   rowData.currentRank ? rowData.currentRank : '-',
      render: () => '-',
    },
    {
      title: 'Time allocation',
      render: (
        rowData: SepProposal & {
          proposalAverageScore: number;
        }
      ) =>
        rowData.proposal.technicalReview &&
        rowData.proposal.technicalReview.timeAllocation
          ? rowData.proposal.technicalReview.timeAllocation
          : '-',
    },
    {
      title: 'Review meeting',
      // render: (rowData: SepProposal) =>
      //   rowData.reviewMeeting ? rowData.reviewMeeting : 'No',
      render: () => 'No',
    },
  ];

  const ViewIcon = (): JSX.Element => <Visibility />;

  return (
    <div className={classes.root} data-cy="sep-instrument-proposals-table">
      <SEPMeetingProposalViewModal
        proposalViewModalOpen={!!openProposalId}
        setProposalViewModalOpen={() => setOpenProposalId(null)}
        proposalId={openProposalId || 0}
      />
      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={'Assigned reviewers'}
        data={proposalsWithAverageScore}
        actions={[
          {
            icon: ViewIcon,
            onClick: (event, data) => {
              setOpenProposalId((data as SepProposal).proposal.id);
            },
            tooltip: 'View proposal details',
          },
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
            rowData.isInAvailabilityZone
              ? {}
              : { backgroundColor: theme.palette.error.light },
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
