import MaterialTable from '@material-table/core';
import GetAppIcon from '@mui/icons-material/GetApp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { BooleanParam, NumberParam, useQueryParams } from 'use-query-params';

import EsiStatusFilter from 'components/common/EsiStatusFilter';
import CallFilter from 'components/common/proposalFilters/CallFilter';
import { GetEsisQuery } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useCallsData } from 'hooks/call/useCallsData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';

import { EsiEvaluationDialog } from './EsiEvaluationDialog';

export type EsiRowData = NonNullable<GetEsisQuery['esis']>[0];

function ExperimentSafetyPage() {
  const { api } = useDataApiWithFeedback();
  const { calls, loadingCalls } = useCallsData({ isActive: true });
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    call: NumberParam,
    hasEvaluation: BooleanParam,
  });
  const { timezone, toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });
  const [selectedCallId, setSelectedCallId] = useState<number>(
    urlQueryParams.call ? urlQueryParams.call : 0
  );
  const [hasEvaluation, setHasEvaluation] = useState<boolean | undefined>(
    urlQueryParams.hasEvaluation ? urlQueryParams.hasEvaluation : false
  );
  const [esis, setEsis] = useState<EsiRowData[]>([]);
  const [selectedEsi, setSelectedEsi] = useState<EsiRowData | null>(null);

  useEffect(() => {
    api()
      .getEsis({
        filter: {
          isSubmitted: true,
          callId: selectedCallId ?? undefined,
          hasEvaluation,
        },
      })
      .then((result) => {
        setEsis(result.esis || []);
      });
  }, [api, selectedCallId, hasEvaluation]);

  const columns = [
    {
      title: 'Actions',
      sorting: false,
      removable: false,
      field: 'rowActions',
    },
    {
      title: 'Proposal ID',
      field: 'proposal.proposalId',
    },
    { title: 'Proposal title', field: 'proposal.title' },

    {
      title: 'Created by',
      render: (esi: EsiRowData) => getFullUserName(esi.creator),
    },
    {
      title: 'Evaluated by',
      render: (esi: EsiRowData) => getFullUserName(esi.esd?.reviewer),
    },
    {
      title: 'Safety evaluation',
      field: 'esd.evaluation',
      render: (rowData: EsiRowData) =>
        rowData.esd?.evaluation ?? 'Not evaluated yet',
    },

    {
      title: `Experiment start date (${timezone})`,
      field: 'formattedEventStartsAt',
    },
  ];

  const RowActionButtons = (rowData: EsiRowData) => (
    <>
      <Tooltip title="Review Experiment Safety Input">
        <IconButton onClick={() => setSelectedEsi(rowData)}>
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Download ESI as pdf">
        <IconButton data-cy="download-esi" onClick={() => {}}>
          <GetAppIcon />
        </IconButton>
      </Tooltip>
    </>
  );

  const samplesWithRowActions = esis.map((esi) => ({
    ...esi,
    rowActions: RowActionButtons(esi),
    formattedEventStartsAt: toFormattedDateTime(esi.scheduledEvent?.startsAt),
  }));

  return (
    <>
      {selectedEsi && (
        <EsiEvaluationDialog
          esi={selectedEsi}
          onClose={(updatedEsi) => {
            if (updatedEsi) {
              const newObjectsArray = esis.map((esi) =>
                updatedEsi.id === esi.id ? updatedEsi : esi
              );
              setEsis(newObjectsArray);
            }
            setSelectedEsi(null);
          }}
        />
      )}
      <StyledContainer>
        <StyledPaper>
          <Box display={'flex'}>
            <CallFilter
              callId={selectedCallId}
              calls={calls}
              isLoading={loadingCalls}
              onChange={(callId) => {
                setSelectedCallId(callId);
              }}
              shouldShowAll={true}
            />
            <EsiStatusFilter
              value={hasEvaluation ?? false}
              onChange={(status) => {
                setHasEvaluation(status);
              }}
            />
          </Box>
          <MaterialTable
            columns={columns}
            icons={tableIcons}
            title={
              <Typography variant="h6" component="h2">
                Experiment safety inputs
              </Typography>
            }
            data={samplesWithRowActions}
          />
        </StyledPaper>
      </StyledContainer>
    </>
  );
}

export default ExperimentSafetyPage;
