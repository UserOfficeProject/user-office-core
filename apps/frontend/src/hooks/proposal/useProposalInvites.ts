import { useCallback, useEffect, useState } from 'react';

// TODO: Uncomment these when integrating with real API
// import { useDataApi } from 'hooks/common/useDataApi';
// import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

interface ProposalInvite {
  id: number;
  proposalTitle: string;
  principalInvestigatorName: string;
  createdAt: string;
  expiresAt?: string | null;
  proposalPk: number;
}

export const useProposalInvites = () => {
  const [invites, setInvites] = useState<ProposalInvite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API call when backend is deployed
      // const result = await api().getUserPendingProposalInvites();
      // setInvites(result.getUserPendingProposalInvites || []);

      // For now, we'll use mock data
      const mockInvites: ProposalInvite[] = [
        {
          id: 1,
          proposalTitle: 'Investigation of Novel Materials Properties',
          principalInvestigatorName: 'Dr. John Smith',
          createdAt: '2025-10-28',
          proposalPk: 123,
        },
        {
          id: 2,
          proposalTitle: 'Advanced Spectroscopy Techniques Study',
          principalInvestigatorName: 'Prof. Jane Doe',
          createdAt: '2025-11-01',
          proposalPk: 124,
        },
      ];

      setInvites(mockInvites);
    } catch (error) {
      console.error('Failed to fetch proposal invites:', error);
      setInvites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptInvite = useCallback(async (inviteId: number) => {
    try {
      // TODO: Replace with real API call when backend is deployed
      // await apiWithFeedback({
      //   toastSuccessMessage: 'Proposal invitation accepted successfully',
      // }).acceptProposalInvite({ inviteId });

      console.log(`Accepting invite ${inviteId}`);

      // Remove the accepted invite from the list
      setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));

      return true;
    } catch (error) {
      console.error('Failed to accept invite:', error);

      return false;
    }
  }, []);

  const declineInvite = useCallback(async (inviteId: number) => {
    try {
      // TODO: Replace with real API call when backend is deployed
      // await apiWithFeedback({
      //   toastSuccessMessage: 'Proposal invitation declined successfully',
      // }).declineProposalInvite({ inviteId });

      console.log(`Declining invite ${inviteId}`);

      // Remove the declined invite from the list
      setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));

      return true;
    } catch (error) {
      console.error('Failed to decline invite:', error);

      return false;
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  return {
    invites,
    loading,
    fetchInvites,
    acceptInvite,
    declineInvite,
  };
};
