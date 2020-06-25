import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React from 'react';

import { SepProposal } from '../../generated/sdk';
import { tableIcons } from '../../utils/materialIcons';

type SEPMeetingComponentsProps = {
  sepId: number;
};

const SEPMeetingComponents: React.FC<SEPMeetingComponentsProps> = () => {
  const columns = [
    { title: 'Name', field: 'id' },
    { title: 'Description', field: 'description' },
    {
      title: 'Instrument scientist',
      field: 'instrumentScientist.name',
    },
  ];

  const SEPProposalsTable = (rowData: SepProposal) => (
    <div>This is proposals table</div>
  );

  return (
    <div data-cy="SEP-meeting-components-table">
      <MaterialTable
        icons={tableIcons}
        title={'Instruments and proposals'}
        columns={columns}
        data={[]}
        detailPanel={[
          {
            tooltip: 'Show Reviewers',
            render: SEPProposalsTable,
          },
        ]}
        options={{
          search: true,
          debounceInterval: 400,
        }}
      />
    </div>
  );
};

SEPMeetingComponents.propTypes = {
  sepId: PropTypes.number.isRequired,
};

export default SEPMeetingComponents;
