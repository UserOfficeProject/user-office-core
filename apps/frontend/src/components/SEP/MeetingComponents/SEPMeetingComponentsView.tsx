import { Options, MTableToolbar } from '@material-table/core';
import GridOnIcon from '@mui/icons-material/GridOn';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { NumberParam, useQueryParams, withDefault } from 'use-query-params';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import { useCallsData } from 'hooks/call/useCallsData';
import { useDownloadXLSXSEP } from 'hooks/SEP/useDownloadXLSXSEP';

import SEPMeetingInstrumentsTable from './SEPMeetingInstrumentsTable';

type SEPMeetingComponentsViewProps = {
  sepId: number;
};

const useStyles = makeStyles((theme) => ({
  spacing: {
    margin: theme.spacing(1),
  },
}));

const SEPMeetingComponentsView = ({ sepId }: SEPMeetingComponentsViewProps) => {
  const classes = useStyles();
  const downloadSEPXLSX = useDownloadXLSXSEP();
  const { loadingCalls, calls } = useCallsData({ sepIds: [sepId] });
  const [query, setQuery] = useQueryParams({
    call: withDefault(NumberParam, null),
  });

  useEffect(() => {
    if (calls.length && !query.call) {
      setQuery({ call: calls[0].id });
    }
  }, [calls, query.call, setQuery]);

  const getSelectedCall = () => {
    return calls.find((call) => call.id === query.call);
  };

  const Toolbar = (data: Options<JSX.Element>): JSX.Element => (
    <>
      <MTableToolbar {...data} />
      <Grid container spacing={2}>
        <Grid item sm={3} xs={12}>
          <CallFilter
            calls={calls}
            isLoading={loadingCalls}
            callId={query.call}
          />
        </Grid>
        <Grid item sm={3} xs={12}>
          <Tooltip title="Export in Excel">
            <IconButton
              aria-label="export in excel"
              className={classes.spacing}
              data-cy="download-sep-xlsx"
              onClick={() => {
                if (query.call) {
                  downloadSEPXLSX(
                    sepId,
                    query.call,
                    calls.find(({ id }) => id === query.call)?.shortCode ??
                      'unknown'
                  );
                }
              }}
            >
              <GridOnIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </>
  );

  return (
    <SEPMeetingInstrumentsTable
      sepId={sepId}
      Toolbar={Toolbar}
      selectedCall={getSelectedCall()}
    />
  );
};

SEPMeetingComponentsView.propTypes = {
  sepId: PropTypes.number.isRequired,
};

export default SEPMeetingComponentsView;
