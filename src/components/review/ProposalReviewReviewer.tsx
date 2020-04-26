import Container from '@material-ui/core/Container';
import React from 'react';

import { useProposalData } from '../../hooks/useProposalData';
import { useReviewData } from '../../hooks/useReviewData';
import SimpleTabs from '../common/TabPanel';
import ProposalQuestionaryReview from '../review/ProposalQuestionaryReview';
import ProposalGrade from './ProposalGrade';

export default function ProposalReview({ match }: { match: any }) {
  const { reviewData } = useReviewData(parseInt(match.params.id));
  const { proposalData } = useProposalData(reviewData?.proposal?.id);

  if (!reviewData || !proposalData) {
    return <p>Loading</p>;
  }

  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={['Information', 'Grade']}>
        <ProposalQuestionaryReview data={proposalData} />
        <ProposalGrade
          onChange={() => console.log('updated')}
          reviewID={reviewData.id}
        />
      </SimpleTabs>
    </Container>
  );
}
