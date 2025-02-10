import React from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { useDataApi } from 'hooks/common/useDataApi';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import TechnicalReviewTemplatesTable from './TechnicalReviewTemplatesTable';

export default function TechnicalReviewTemplatesPage() {
  const api = useDataApi();

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <SimpleTabs tabNames={['Current', 'Archived']}>
          <TechnicalReviewTemplatesTable
            dataProvider={() =>
              api()
                .getTechnicalReviewTemplates({ filter: { isArchived: false } })
                .then((data) => data.technicalReviewTemplates || [])
            }
          />
          <TechnicalReviewTemplatesTable
            dataProvider={() =>
              api()
                .getTechnicalReviewTemplates({ filter: { isArchived: true } })
                .then((data) => data.technicalReviewTemplates || [])
            }
          />
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}
