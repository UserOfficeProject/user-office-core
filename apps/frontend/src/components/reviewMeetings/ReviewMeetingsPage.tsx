import React from 'react';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ReviewMeetingsTable from './ReviewMeetingTable';

const ReviewMeetingsPage = () => {
  return (
    <StyledContainer>
      <StyledPaper>
        <ReviewMeetingsTable />
      </StyledPaper>
    </StyledContainer>
  );
};

export default ReviewMeetingsPage;
