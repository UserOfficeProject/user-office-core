import IconButton from '@material-ui/core/IconButton';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Tooltip from '@material-ui/core/Tooltip';
import GridOnIcon from '@material-ui/icons/GridOn';
import { Options, MTableToolbar } from 'material-table';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

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

const SEPMeetingComponentsView: React.FC<SEPMeetingComponentsViewProps> = ({
  sepId,
}) => {
  const classes = useStyles();
  const downloadSEPXLSX = useDownloadXLSXSEP();
  const { loadingCalls, calls } = useCallsData();
  // NOTE: Default call is with id=1
  const [selectedCallId, setSelectedCallId] = useState<number>(1);

  const Toolbar = (data: Options): JSX.Element => (
    <>
      <MTableToolbar {...data} />
      <CallFilter
        calls={calls}
        isLoading={loadingCalls}
        onChange={setSelectedCallId}
        callId={selectedCallId}
      />
      <Tooltip title="Export in Excel">
        <IconButton
          aria-label="export in excel"
          className={classes.spacing}
          data-cy="download-sep-xlsx"
          onClick={() =>
            downloadSEPXLSX(
              sepId,
              selectedCallId,
              calls.find(({ id }) => id === selectedCallId)?.shortCode ??
                'unknown'
            )
          }
        >
          <GridOnIcon />
        </IconButton>
      </Tooltip>
    </>
  );

  return (
    <SEPMeetingInstrumentsTable
      sepId={sepId}
      Toolbar={Toolbar}
      selectedCallId={selectedCallId}
    />
  );
};

SEPMeetingComponentsView.propTypes = {
  sepId: PropTypes.number.isRequired,
};

export default SEPMeetingComponentsView;
