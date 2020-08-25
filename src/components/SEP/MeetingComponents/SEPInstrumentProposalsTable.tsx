import { makeStyles } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { Visibility } from '@material-ui/icons';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { AdministrationFormData } from 'components/proposal/ProposalAdmin';
import { SepProposal, InstrumentWithAvailabilityTime } from 'generated/sdk';
import { useSEPProposalsByInstrument } from 'hooks/SEP/useSEPProposalsByInstrument';
import { tableIcons } from 'utils/materialIcons';
import { getGrades, average } from 'utils/mathFunctions';

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
    setInstrumentProposalsData,
  } = useSEPProposalsByInstrument(sepInstrument.id, sepId, selectedCallId);
  const classes = useStyles();
  const theme = useTheme();
  const [openProposalId, setOpenProposalId] = useState<number | null>(null);

  const sortByRankOrder = (a: SepProposal, b: SepProposal) => {
    if (a.proposal.rankOrder === b.proposal.rankOrder) {
      return -1;
    } else if (a.proposal.rankOrder === null) {
      return 1;
    } else if (b.proposal.rankOrder === null) {
      return -1;
    } else {
      return a.proposal.rankOrder > b.proposal?.rankOrder ? 1 : -1;
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
    { title: 'Status', field: 'proposal.status' },
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
      ) =>
        rowData.proposal.technicalReview &&
        rowData.proposal.technicalReview.timeAllocation
          ? rowData.proposal.technicalReview.timeAllocation
          : '-',
    },
    {
      title: 'Review meeting',
      render: (rowData: SepProposal): string =>
        rowData.proposal.rankOrder ? 'Yes' : 'No',
    },
  ];

  const onMeetingSubmited = (data: AdministrationFormData) => {
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

  const redBackgroundWhenOutOfAvailabiliyZone = (
    isInsideAvailabilityZone: boolean
  ): CSSProperties =>
    isInsideAvailabilityZone
      ? {}
      : { backgroundColor: theme.palette.error.light };

  return (
    <div className={classes.root} data-cy="sep-instrument-proposals-table">
      <SEPMeetingProposalViewModal
        proposalViewModalOpen={!!openProposalId}
        setProposalViewModalOpen={() => setOpenProposalId(null)}
        proposalId={openProposalId || 0}
        meetingSubmited={onMeetingSubmited}
      />
      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={'Assigned reviewers'}
        data={sortedProposalsWithAverageScore}
        isLoading={loadingInstrumentProposals}
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
            redBackgroundWhenOutOfAvailabiliyZone(rowData.isInAvailabilityZone),
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
