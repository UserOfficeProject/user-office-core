import Container from '@material-ui/core/Container';
import React from 'react';
import { useParams } from 'react-router';

import { useProposalData } from '../../hooks/useProposalData';
import { useReviewData } from '../../hooks/useReviewData';
import SimpleTabs from '../common/TabPanel';
import ProposalQuestionaryReview from '../review/ProposalQuestionaryReview';
import ProposalGrade from './ProposalGrade';
import TechnicalReviewInformation from './TechnicalReviewInformation';

export default function ProposalReview() {
  const { id } = useParams();
  const { reviewData } = useReviewData(parseInt(id!));
  const { proposalData } = useProposalData(reviewData?.proposal?.id);

  if (!reviewData || !proposalData) {
    return <p>Loading</p>;
  }

  return (
    <Container maxWidth="lg">
      <SimpleTabs
        tabNames={['Proposal Information', 'Technical Review', 'Grade']}
      >
        <ProposalQuestionaryReview data={proposalData} />
        <TechnicalReviewInformation data={proposalData.technicalReview} />
        <ProposalGrade
          onChange={() => console.log('updated')}
          reviewID={parseInt(id!)}
        />
      </SimpleTabs>
    </Container>
  );
}
