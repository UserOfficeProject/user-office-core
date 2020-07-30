import Container from '@material-ui/core/Container';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useCallback } from 'react';

import { useCheckAccess } from 'components/common/Can';
import SimpleTabs from 'components/common/TabPanel';
import UOLoader from 'components/common/UOLoader';
import EventLogList from 'components/eventLog/EventLogList';
import GeneralInformation from 'components/proposal/GeneralInformation';
import ParticipantModal from 'components/proposal/ParticipantModal';
import ProposalAdmin, {
  AdministrationFormData,
} from 'components/proposal/ProposalAdmin';
import {
  Proposal,
  CoreTechnicalReviewFragment,
  UserRole,
  Review,
  BasicUserDetails,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

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
    CoreTechnicalReviewFragment | null | undefined
  >(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const api = useDataApi();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const loadProposal = useCallback(async () => {
    return api()
      .getProposal({ id: parseInt(match.params.id) })
      .then(data => {
        setProposal(data.proposal as Proposal);
        if (data.proposal) {
          setTechReview(data.proposal.technicalReview);
          setReviews((data.proposal.reviews as Review[]) || []);
        }
      });
  }, [api, match.params.id]);

  useEffect(() => {
    loadProposal();
  }, [loadProposal]);

  const addUser = async (users: BasicUserDetails[]): Promise<void> => {
    // NOTE: This is now working! Do we really need this?
    // TODO: This should be reviewed here because we wont have adding user for review outside SEPs.
    await api().addUserForReview({
      userID: users[0].id,
      proposalID: parseInt(match.params.id),
      sepID: 0,
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
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const tabNames = ['General', 'Excellence', 'Technical', 'Admin'];

  if (isUserOfficer) {
    tabNames.push('Logs');
  }

  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={tabNames}>
        <GeneralInformation
          data={proposal}
          onProposalChanged={(newProposal): void => setProposal(newProposal)}
        />
        <>
          <ParticipantModal
            show={modalOpen}
            close={() => setOpen(false)}
            addParticipants={addUser}
            selectedUsers={reviews.map(review => review.userID)}
            title={'Reviewer'}
            selection={true}
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
        <ProposalAdmin
          data={proposal}
          setAdministration={(data: AdministrationFormData) =>
            setProposal({ ...proposal, ...data })
          }
        />
        {isUserOfficer && (
          <EventLogList changedObjectId={proposal.id} eventType="PROPOSAL" />
        )}
      </SimpleTabs>
    </Container>
  );
};

ProposalReview.propTypes = ProposalReviewPropTypes;

export default ProposalReview;
