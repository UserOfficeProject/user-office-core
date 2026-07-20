import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React from 'react';

import { InstrumentWithManagementTime, ProposalEndStatus } from 'generated/sdk';
import { ProposalData } from 'hooks/proposal/useProposalData';

type ProposalAdminReadOnlyProps = {
  data: ProposalData;
};

const ProposalAdminReadOnly = ({ data }: ProposalAdminReadOnlyProps) => {
  if (!data.instruments?.length) {
    return (
      <div data-cy="no-instrument-message">
        Proposal has to be assigned to an instrument for administration
      </div>
    );
  }

  return (
    <>
      <Typography variant="h6" component="h2" gutterBottom>
        Administration
      </Typography>
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Paper
            elevation={0}
            sx={(theme) => ({
              padding: theme.spacing(2),
              backgroundColor: theme.palette.grey[50],
            })}
          >
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Status
            </Typography>
            <Typography variant="body1" data-cy="proposal-final-status">
              {data.finalStatus || ProposalEndStatus.UNSET}
            </Typography>
          </Paper>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Paper
            elevation={0}
            sx={(theme) => ({
              padding: theme.spacing(2),
              backgroundColor: theme.palette.grey[50],
            })}
          >
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Management Decision
            </Typography>
            <Typography
              variant="body1"
              data-cy="is-management-decision-submitted"
            >
              {data.managementDecisionSubmitted ? 'Submitted' : 'Not Submitted'}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={12}>
          <Paper
            elevation={0}
            sx={(theme) => ({
              padding: theme.spacing(2),
              backgroundColor: theme.palette.grey[50],
            })}
          >
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Management Time Allocation
            </Typography>
            {data.instruments?.map((instrument) => {
              const managementTimeAllocation =
                (instrument as InstrumentWithManagementTime)
                  .managementTimeAllocation ?? 'Not set';

              return (
                <Box
                  key={instrument?.id}
                  sx={{ marginTop: 1 }}
                  data-cy={`managementTimeAllocation-${instrument?.id}`}
                >
                  <Typography variant="body1">
                    <strong>{instrument?.name}:</strong>{' '}
                    {managementTimeAllocation}{' '}
                    {managementTimeAllocation !== 'Not set'
                      ? `${data.call?.allocationTimeUnit}(s)`
                      : ''}
                  </Typography>
                </Box>
              );
            })}
          </Paper>
        </Grid>

        <Grid size={12}>
          <Paper
            elevation={0}
            sx={(theme) => ({
              padding: theme.spacing(2),
              backgroundColor: theme.palette.grey[50],
            })}
          >
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Comment for User
            </Typography>
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap' }}
              data-cy="commentForUser"
            >
              {data.commentForUser || ''}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={12}>
          <Paper
            elevation={0}
            sx={(theme) => ({
              padding: theme.spacing(2),
              backgroundColor: theme.palette.grey[50],
            })}
          >
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Comment for Management
            </Typography>
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap' }}
              data-cy="commentForManagement"
            >
              {data.commentForManagement || ''}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default ProposalAdminReadOnly;
