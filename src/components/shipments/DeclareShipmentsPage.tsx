import React from 'react';
import { useParams } from 'react-router';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import DeclareShipments from './DeclareShipments';

export default function DeclareShipmentsPage() {
  const { scheduledEventId } = useParams<{ scheduledEventId: string }>();

  if (!scheduledEventId) {
    return <span>Missing query params</span>;
  }

  return (
    <StyledContainer>
      <StyledPaper>
        <DeclareShipments scheduledEventId={+scheduledEventId} />
      </StyledPaper>
    </StyledContainer>
  );
}
