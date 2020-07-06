import { makeStyles } from '@material-ui/core';
import { Visibility } from '@material-ui/icons';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React from 'react';

import { Instrument, SepProposal } from '../../generated/sdk';
import { useSEPProposalsByInstrument } from '../../hooks/useSEPProposalsByInstrument';
import { tableIcons } from '../../utils/materialIcons';

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
  sepInstrument: Instrument;
  sepId: number;
};

const SEPInstrumentProposalsTable: React.FC<SEPInstrumentProposalsTableProps> = ({
  sepInstrument,
  sepId,
}) => {
  const {
    instrumentProposalsData,
    loadingInstrumentProposals,
  } = useSEPProposalsByInstrument(sepInstrument.instrumentId, sepId);
  const classes = useStyles();

  if (loadingInstrumentProposals) {
    return <div>Loading...</div>;
  }

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
      // render: (rowData: SepProposal) =>
      //   rowData.initialRank ? rowData.initialRank : '-',
      render: () => '-',
    },
    {
      title: 'Current rank',
      // render: (rowData: SepProposal) =>
      //   rowData.currentRank ? rowData.currentRank : '-',
      render: () => '-',
    },
    {
      title: 'Review meeting',
      // render: (rowData: SepProposal) =>
      //   rowData.reviewMeeting ? rowData.reviewMeeting : '-',
      render: () => '-',
    },
  ];

  const ViewIcon = (): JSX.Element => <Visibility />;

  return (
    <div className={classes.root} data-cy="sep-instrument-proposals-table">
      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={'Assigned reviewers'}
        data={instrumentProposalsData}
        actions={[
          {
            icon: ViewIcon,
            onClick: (event, data: SepProposal | SepProposal[]) => {
              console.log('View proposal details', data);
            },
            tooltip: 'View proposal details',
          },
        ]}
        options={{
          search: false,
          paging: false,
          toolbar: false,
          headerStyle: { backgroundColor: '#fafafa' },
        }}
      />
    </div>
  );
};

SEPInstrumentProposalsTable.propTypes = {
  sepInstrument: PropTypes.any.isRequired,
  sepId: PropTypes.number.isRequired,
};

export default SEPInstrumentProposalsTable;
