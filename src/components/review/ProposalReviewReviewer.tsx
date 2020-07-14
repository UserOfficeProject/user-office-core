import PropTypes from 'prop-types';
import React from 'react';
import { useParams } from 'react-router';

import SimpleTabs from 'components/common/TabPanel';
import ProposalQuestionaryReview from 'components/review/ProposalQuestionaryReview';
import { useProposalData } from 'hooks/proposal/useProposalData';
import { useReviewData } from 'hooks/review/useReviewData';

import ProposalGrade from './ProposalGrade';
import TechnicalReviewInformation from './TechnicalReviewInformation';

type ProposalReviewProps = {
  reviewId?: number;
};

const ProposalReview: React.FC<ProposalReviewProps> = ({ reviewId }) => {
  const { id } = useParams();
  const { reviewData } = useReviewData(reviewId || +(id as string));
  const { proposalData } = useProposalData(reviewData?.proposal?.id);

  if (!reviewData || !proposalData) {
    return <p>Loading</p>;
  }

  return (
    <SimpleTabs
      tabNames={['Proposal Information', 'Technical Review', 'Grade']}
    >
      <ProposalQuestionaryReview data={proposalData} />
      <TechnicalReviewInformation data={proposalData.technicalReview} />
      <ProposalGrade
        onChange={() => console.log('updated')}
        reviewID={reviewId || +(id as string)}
      />
    </SimpleTabs>
  );
};

ProposalReview.propTypes = {
  reviewId: PropTypes.number,
};

export default ProposalReview;
