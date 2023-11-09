import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { TemplateGroupId } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import PdfTemplatesTable from './PdfTemplatesTable';

export default function PdfTemplatesPage() {
  const api = useDataApi();

  return (
    <StyledContainer>
      <StyledPaper>
        <SimpleTabs tabNames={['Current', 'Archived']}>
          <PdfTemplatesTable
            dataProvider={() =>
              api()
                .getPdfTemplates({
                  filter: {
                    isArchived: false,
                    group: TemplateGroupId.PDF_TEMPLATE,
                  },
                })
                .then((data) => data.templates || [])
            }
          />
          <PdfTemplatesTable
            dataProvider={() =>
              api()
                .getPdfTemplates({
                  filter: {
                    isArchived: true,
                    group: TemplateGroupId.PDF_TEMPLATE,
                  },
                })
                .then((data) => data.templates || [])
            }
          />
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}
