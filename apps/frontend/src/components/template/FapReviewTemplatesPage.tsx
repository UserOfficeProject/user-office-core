import React from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { useDataApi } from 'hooks/common/useDataApi';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import FapReviewTemplatesTable from './FapReviewTemplatesTable';

export default function FapReviewTemplatesPage() {
  const api = useDataApi();

  return (
    <StyledContainer>
      <StyledPaper>
        <SimpleTabs tabNames={['Current', 'Archived']}>
          <FapReviewTemplatesTable
            dataProvider={() =>
              api()
                .getFapReviewTemplates({ filter: { isArchived: false } })
                .then((data) => data.fapReviewTemplates || [])
            }
          />
          <FapReviewTemplatesTable
            dataProvider={() =>
              api()
                .getFapReviewTemplates({ filter: { isArchived: true } })
                .then((data) => data.fapReviewTemplates || [])
            }
          />
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}
