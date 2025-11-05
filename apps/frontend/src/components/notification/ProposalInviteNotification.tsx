import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';

import { useProposalInvites } from 'hooks/invite/useProposalInvites';

interface ProposalInviteNotificationProps {
  // We'll fetch the invites directly rather than passing count
}

const ProposalInviteNotification: React.FC<
  ProposalInviteNotificationProps
> = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processingInviteId, setProcessingInviteId] = useState<number | null>(
    null
  );
  const { proposalInvites, loading, acceptInvite, declineInvite } =
    useProposalInvites();

  const handleViewInvites = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleAcceptInvite = async (inviteId: number) => {
    // setProcessingInviteId(inviteId);
    // const success = await acceptInvite(inviteId);
    // setProcessingInviteId(null);
    // if (success && userProposalInvites.length === 1) {
    //   // If this was the last invite, close the dialog
    //   setIsDialogOpen(false);
    // }
  };

  const handleDeclineInvite = async (inviteId: number) => {
    // setProcessingInviteId(inviteId);
    // const success = await declineInvite(inviteId);
    // setProcessingInviteId(null);
    // if (success && userProposalInvites.length === 1) {
    //   // If this was the last invite, close the dialog
    //   setIsDialogOpen(false);
    // }
  };

  if (proposalInvites.length === 0) {
    return null;
  }

  const inviteCount = proposalInvites.length;

  return (
    <>
      <Alert
        severity="info"
        sx={{
          marginBottom: 2,
          '& .MuiAlert-message': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          },
        }}
      >
        <Typography variant="body1">
          You have {inviteCount} outstanding invitation
          {inviteCount > 1 ? 's' : ''} to join proposal
          {inviteCount > 1 ? 's' : ''}.
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={handleViewInvites}
          disabled={loading}
          sx={{ marginLeft: 2 }}
        >
          {loading ? 'Loading...' : 'View Invitations'}
        </Button>
      </Alert>

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
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
              <Alert
                key={invite.id}
                severity="info"
                sx={{
                  marginBottom: 2,
                  '& .MuiAlert-message': {
                    width: '100%',
                  },
                }}
                action={
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      color="primary"
                      size="small"
                      variant="contained"
                      onClick={() => handleAcceptInvite(invite.id)}
                      disabled={processingInviteId === invite.id}
                    >
                      {processingInviteId === invite.id
                        ? 'Processing...'
                        : 'Accept'}
                    </Button>
                    <Button
                      color="secondary"
                      size="small"
                      variant="outlined"
                      onClick={() => handleDeclineInvite(invite.id)}
                      disabled={processingInviteId === invite.id}
                    >
                      {processingInviteId === invite.id
                        ? 'Processing...'
                        : 'Decline'}
                    </Button>
                  </div>
                }
              >
                <div>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {invite.proposal?.title || 'No Title'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Principal Investigator: asd
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Invited on:{' '}
                    {new Date(invite.createdAt).toLocaleDateString()}
                  </Typography>
                </div>
              </Alert>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProposalInviteNotification;
