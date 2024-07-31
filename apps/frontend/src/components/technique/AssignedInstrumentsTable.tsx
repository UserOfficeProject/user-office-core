import MaterialTable from '@material-table/core';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Technique } from 'generated/sdk';

type AssignedInstrumentsTableProps = {
  technique: Technique;
};

const instrumentContactColumns = [
  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Short code',
    field: 'shortCode',
  },
  {
    title: 'Description',
    field: 'description',
  },
  {
    title: 'Scientists',
    field: 'scientists.length',
    emptyValue: '-',
  },
];
const AssignedInstrumentsTable = ({
  technique,
}: AssignedInstrumentsTableProps) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        '& tr:last-child td': {
          border: 'none',
        },
        '& .MuiPaper-root': {
          padding: '0 40px',
          backgroundColor: '#fafafa',
        },
      }}
      data-cy="technique-instrument-assignments-table"
    >
      <MaterialTable
        columns={instrumentContactColumns}
        title={t('instrument') + ' Details'}
        data={technique.instruments}
        options={{
          search: false,
          paging: false,
          headerStyle: { backgroundColor: '#fafafa' },
        }}
      />
    </Box>
  );
};

AssignedInstrumentsTable.propTypes = {
  instrument: PropTypes.any.isRequired,
};

export default AssignedInstrumentsTable;
