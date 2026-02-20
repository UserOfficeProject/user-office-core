import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { useProposalInvites } from 'hooks/invite/useProposalInvites';

const ProposalInviteNotification = ({ onAccept }: { onAccept: () => void }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    proposalInvites,
    loading,
    processingInviteId,
    acceptCoProposerInvite,
  } = useProposalInvites();
  const { enqueueSnackbar } = useSnackbar();

  if (proposalInvites.length === 0) {
    return null;
  }

  const inviteCount = proposalInvites.length;

  const handleAcceptCoProposerInvite = async (inviteId: number) => {
    try {
      await acceptCoProposerInvite(inviteId);
      enqueueSnackbar(
        `Invitation for the Proposal "${proposalInvites.find((invite) => invite.id === inviteId)?.proposal?.title || ''}" accepted successfully.`,
        {
          variant: 'success',
        }
      );
      onAccept();
    } catch {
      enqueueSnackbar(
        `Failed to accept the invitation for the proposal "${proposalInvites.find((invite) => invite.id === inviteId)?.proposal?.title || ''}". Please try again later.`,
        {
          variant: 'error',
        }
      );
    }
  };

  return (
    <>
      <Box
        data-testid="proposal-invite-notification"
        sx={{
          backgroundColor: (theme) => alpha(theme.palette.info.main, 0.12),
          border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.5)}`,
          color: 'info.main',
          borderRadius: 1,
          padding: 2,
          marginBottom: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon />
          <Typography variant="body1" color="textSecondary">
            You have {inviteCount} outstanding invitation
            {inviteCount > 1 ? 's' : ''} to join proposal
            {inviteCount > 1 ? 's' : ''}.
          </Typography>
        </Box>
        <Button
          data-testid="view-invitations-btn"
          variant="contained"
          size="small"
          onClick={() => setIsDialogOpen(true)}
          disabled={loading}
          sx={{ marginLeft: 2 }}
        >
          {loading ? 'Loading...' : 'View Invitations'}
        </Button>
      </Box>

      <Dialog
        data-testid="proposal-invite-dialog"
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Proposal Invitations</Typography>
        </DialogTitle>
        <DialogContent>
          {proposalInvites.length === 0 ? (
            <Typography variant="body1" color="textSecondary">
              No pending invitations found.
            </Typography>
          ) : (
            proposalInvites.map((invite) => (
              <>
                {invite.proposal && (
                  <Box
                    key={invite.id}
                    sx={{
                      backgroundColor: (theme) =>
                        alpha(theme.palette.info.main, 0.12),
                      border: (theme) =>
                        `1px solid ${alpha(theme.palette.info.main, 0.5)}`,
                      color: 'info.main',
                      borderRadius: 1,
                      padding: 2,
                      marginBottom: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <div>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {invite.proposal.title || 'No Title'}
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        Principal Investigator: {invite.proposal.proposerName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Invited on:
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </Typography>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button
                        data-testid={`accept-invite-btn-${invite.id}`}
                        color="primary"
                        size="small"
                        variant="contained"
                        onClick={() => handleAcceptCoProposerInvite(invite.id)}
                        disabled={processingInviteId === invite.id}
                      >
                        {processingInviteId === invite.id
                          ? 'Processing...'
                          : 'Accept'}
                      </Button>
                    </div>
                  </Box>
                )}
              </>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProposalInviteNotification;
