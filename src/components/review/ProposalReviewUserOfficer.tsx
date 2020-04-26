import Container from '@material-ui/core/Container';
import React, { useEffect, useState } from 'react';

import {
  Proposal,
  TechnicalReview,
  UserRole,
  Review,
} from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import SimpleTabs from '../common/TabPanel';
import EventLogList from '../eventLog/EventLogList';
import GeneralInformation from '../proposal/GeneralInformation';
import ParticipantModal from '../proposal/ParticipantModal';
import ProposalTechnicalReview from './ProposalTechnicalReview';
import ReviewTable from './ReviewTable';

export default function ProposalReview({ match }: { match: any }) {
  const [modalOpen, setOpen] = useState(false);
  const [techReview, setTechReview] = useState<
    TechnicalReview | null | undefined
  >(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const api = useDataApi();

  const loadProposal = () =>
    api()
      .getProposal({ id: parseInt(match.params.id) })
      .then(data => {
        setProposal(data.proposal);
        if (data.proposal) {
          setTechReview(data.proposal.technicalReview);
          setReviews(data.proposal.reviews);
        }
      });

  useEffect(() => {
    loadProposal();
  }, [api, match.params.id]);

  const addUser = async (user: any) => {
    await api().addUserForReview({
      userID: user.id,
      proposalID: parseInt(match.params.id),
    });
    setOpen(false);
    loadProposal();
  };

  const removeReview = async (reviewID: number) => {
    await api().removeUserForReview({
      reviewID,
    });
    setReviews(reviews.filter(review => review.id !== reviewID));
  };

  if (!proposal) {
    return <p>Loading</p>;
  }

  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={['General', 'Excellence', 'Technical', 'Logs']}>
        <GeneralInformation
          data={proposal}
          onProposalChanged={newProposal => setProposal(newProposal)}
        />
        <>
          <ParticipantModal
            show={modalOpen}
            close={setOpen}
            addParticipant={addUser}
            selectedUsers={reviews.map(review => review.userID)}
            title={'Reviewer'}
            userRole={UserRole.REVIEWER}
          />
          <ReviewTable
            data={reviews}
            addReviewer={setOpen}
            removeReview={removeReview}
            onChange={loadProposal}
          />
        </>
        <ProposalTechnicalReview
          id={proposal.id}
          data={techReview}
          setReview={setTechReview}
        />
        <EventLogList changedObjectId={proposal.id} eventType="PROPOSAL" />
      </SimpleTabs>
    </Container>
  );
}
