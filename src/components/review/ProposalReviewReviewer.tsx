import Container from '@material-ui/core/Container';
import React from 'react';
import SimpleTabs from '../common/TabPanel';
import ProposalGrade from './ProposalGrade';
import { useReviewData } from '../../hooks/useReviewData';
import { useProposalData } from '../../hooks/useProposalData';
import ProposalQuestionaryReview from '../review/ProposalQuestionaryReview';
import TechnicalReviewInformation from './TechnicalReviewInformation';


export default function ProposalReview({ match }: { match: any }) {
  const { reviewData } = useReviewData(parseInt(match.params.id));
  const { proposalData } = useProposalData(reviewData?.proposal?.id);

  if(!reviewData || !proposalData){
    return <p>Loading</p>;
  }

  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={['Proposal Information', 'Technical Review',  'Grade']}>
        <ProposalQuestionaryReview data={proposalData} />
        <TechnicalReviewInformation data={proposalData.technicalReview} />
        <ProposalGrade onChange={() => console.log("updated")} reviewID={reviewData.id} />
      </SimpleTabs>
    </Container>
  );
}
