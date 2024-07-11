import MaterialTable from '@material-table/core';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Technique } from 'generated/sdk';

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
  const classes = useStyles();

  const { t } = useTranslation();

  return (
    <div
      className={classes.root}
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
    </div>
  );
};

AssignedInstrumentsTable.propTypes = {
  technique: PropTypes.any.isRequired,
};

export default AssignedInstrumentsTable;
