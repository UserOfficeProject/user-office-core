import Container from '@material-ui/core/Container';
import React from 'react';
import SimpleTabs from '../common/TabPanel';
import ProposalGrade from './ProposalGrade';
import { useReviewData } from '../../hooks/useReviewData';
import { useProposalData } from '../../hooks/useProposalData';
import ProposalQuestionaryReview from '../review/ProposalQuestionaryReview';

export default function ProposalReview({ match }: { match: any }) {
  const { reviewData } = useReviewData(parseInt(match.params.id));
  const { proposalData } = useProposalData(reviewData?.proposal?.id);

  if(!reviewData || !proposalData){
    return <p>Loading</p>;
  }

  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={['Information', 'Grade']}>
        <ProposalQuestionaryReview data={proposalData} />
        <ProposalGrade onChange={() => console.log("updated")} reviewID={reviewData.id} />
      </SimpleTabs>
    </Container>
  );
}
