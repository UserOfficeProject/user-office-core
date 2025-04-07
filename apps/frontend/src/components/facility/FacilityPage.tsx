import React from 'react';

import { UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import { FacilityOverview } from './FacilityOverview';
import FacilityTable from './FacilityTable';

const FacilityPage = () => {
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        {isUserOfficer ? <FacilityTable /> : <FacilityOverview />}
      </StyledPaper>
    </StyledContainer>
  );
};

export default FacilityPage;
