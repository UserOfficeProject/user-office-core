import Container from '@material-ui/core/Container';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useCallback } from 'react';

import {
  Proposal,
  TechnicalReview,
  UserRole,
  Review,
  BasicUserDetails,
} from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import SimpleTabs from '../common/TabPanel';
import EventLogList from '../eventLog/EventLogList';
import GeneralInformation from '../proposal/GeneralInformation';
import ParticipantModal from '../proposal/ParticipantModal';
import ProposalTechnicalReview from './ProposalTechnicalReview';
import ReviewTable from './ReviewTable';

const ProposalReviewPropTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

type ProposalReviewProps = PropTypes.InferProps<typeof ProposalReviewPropTypes>;

const ProposalReview: React.FC<ProposalReviewProps> = ({ match }) => {
  const [modalOpen, setOpen] = useState(false);
  const [techReview, setTechReview] = useState<
    TechnicalReview | null | undefined
  >(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const api = useDataApi();
  const loadProposal = useCallback(async () => {
    return api()
      .getProposal({ id: parseInt(match.params.id) })
      .then(data => {
        setProposal(data.proposal);
        if (data.proposal) {
          setTechReview(data.proposal.technicalReview);
          setReviews(data.proposal.reviews || []);
        }
      });
  }, [api, match.params.id]);

  useEffect(() => {
    loadProposal();
  }, [loadProposal]);

  const addUser = async (user: BasicUserDetails): Promise<void> => {
    await api().addUserForReview({
      userID: user.id,
      proposalID: parseInt(match.params.id),
    });
    setOpen(false);
    loadProposal();
  };

  const removeReview = async (reviewID: number): Promise<void> => {
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
          onProposalChanged={(newProposal): void => setProposal(newProposal)}
        />
        <>
          <ParticipantModal
            show={modalOpen}
            close={() => setOpen(false)}
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
};

ProposalReview.propTypes = ProposalReviewPropTypes;

export default ProposalReview;
