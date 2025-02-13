import React from 'react';
import { useParams } from 'react-router-dom';

import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import DeclareShipments from './DeclareShipments';

export default function DeclareShipmentsPage() {
  const { experimentPk } = useParams<{ experimentPk: string }>();

  if (!experimentPk) {
    return <span>Missing query params</span>;
  }

  return (
    <StyledContainer>
      <StyledPaper>
        <DeclareShipments experimentPk={+experimentPk} />
      </StyledPaper>
    </StyledContainer>
  );
}
